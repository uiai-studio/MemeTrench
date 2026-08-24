use anchor_lang::prelude::*;

declare_id!("TRNCHFloorVault11111111111111111111111111111");

pub const DOWNSIDE_INSURANCE_EXPIRY_SECONDS: i64 = 72 * 3600; // 72 hours
pub const MILESTONE_1_TARGET_LAMPORTS: u64 = 30_000_000_000; // $100K MC target threshold

#[program]
pub mod floor_insurance_vault {
    use super::*;

    pub fn deposit_fee(ctx: Context<DepositFee>, amount: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault_state;
        vault.total_sol_escrowed = vault.total_sol_escrowed.checked_add(amount).unwrap();

        let cpi_transfer = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.vault_sol_account.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_transfer, amount)?;
        Ok(())
    }

    /// Permissionless Crank to trigger 72h evaluation
    pub fn trigger_evaluation(ctx: Context<TriggerEvaluation>) -> Result<()> {
        let vault = &mut ctx.accounts.vault_state;
        let clock = Clock::get()?;

        require!(
            clock.unix_timestamp >= vault.creation_timestamp + DOWNSIDE_INSURANCE_EXPIRY_SECONDS,
            VaultError::EvaluationPeriodNotElapsed
        );
        require!(
            vault.status == VaultStatus::Active,
            VaultError::VaultNotActive
        );

        if !vault.milestone_1_reached {
            // Milestone 1 ($100k MC) not achieved within 72 hours!
            // Transition state to RefundActive; Dev locked tokens will be burned
            vault.status = VaultStatus::RefundActive;
            msg!("72h Expiry Reached without Milestone 1! Zero-Loss Downside Refund Activated.");
        } else {
            vault.status = VaultStatus::Matured;
            msg!("Milestone 1 Achieved within 72h! Insurance Vault Matured.");
        }

        Ok(())
    }

    /// Claim pro-rata SOL restitution from floor insurance vault
    pub fn claim_pro_rata_refund(
        ctx: Context<ClaimRefund>,
        token_amount_to_return: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault_state;
        require!(
            vault.status == VaultStatus::RefundActive,
            VaultError::RefundsNotActive
        );
        require!(token_amount_to_return > 0, VaultError::ZeroTokenAmount);

        // Pro-rata SOL share = (token_amount / total_token_supply_at_launch) * vault_sol_balance
        let current_vault_balance = ctx.accounts.vault_sol_account.lamports();
        let refund_sol = (token_amount_to_return as u128)
            .checked_mul(current_vault_balance as u128)
            .unwrap()
            .checked_div(vault.total_token_supply_at_launch as u128)
            .unwrap() as u64;

        require!(refund_sol > 0, VaultError::RefundCalculationZero);

        // Transfer SOL from vault PDA to buyer
        **ctx.accounts.vault_sol_account.to_account_info().try_borrow_mut_lamports()? -= refund_sol;
        **ctx.accounts.buyer.to_account_info().try_borrow_mut_lamports()? += refund_sol;

        msg!(
            "Claimed {} lamports SOL restitution from Floor Vault in exchange for {} tokens",
            refund_sol,
            token_amount_to_return
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositFee<'info> {
    #[account(mut)]
    pub vault_state: Account<'info, VaultState>,
    #[account(mut)]
    /// CHECK: Vault SOL PDA
    pub vault_sol_account: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TriggerEvaluation<'info> {
    #[account(mut)]
    pub vault_state: Account<'info, VaultState>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub vault_state: Account<'info, VaultState>,
    #[account(mut)]
    /// CHECK: Vault SOL PDA
    pub vault_sol_account: AccountInfo<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct VaultState {
    pub pool: Pubkey,
    pub total_sol_escrowed: u64,
    pub total_token_supply_at_launch: u64,
    pub creation_timestamp: i64,
    pub milestone_1_reached: bool,
    pub status: VaultStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum VaultStatus {
    Active,
    RefundActive,
    RefundClaimed,
    Matured,
}

#[error_code]
pub enum VaultError {
    #[msg("The 72-hour evaluation period has not yet elapsed.")]
    EvaluationPeriodNotElapsed,
    #[msg("Vault is no longer in Active state.")]
    VaultNotActive,
    #[msg("Pro-rata refund is only active if Milestone 1 was not achieved within 72h.")]
    RefundsNotActive,
    #[msg("Token amount must be greater than zero.")]
    ZeroTokenAmount,
    #[msg("Calculated refund amount is zero.")]
    RefundCalculationZero,
}
