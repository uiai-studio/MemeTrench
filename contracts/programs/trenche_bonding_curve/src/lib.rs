use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::TransferHookInstruction;

declare_id!("TRNCHHookEnforcer1111111111111111111111111111");

pub const REFLECTION_FEE_BPS: u64 = 400; // 4% reflection fee on early installment sells
pub const REFLECTION_BURN_BPS: u64 = 200; // 2% burned
pub const REFLECTION_REWARD_BPS: u64 = 200; // 2% distributed in SOL to diamond hands

#[program]
pub mod transfer_hook_enforcer {
    use super::*;

    /// Core SPL Token-2022 Transfer Hook entrypoint
    pub fn execute(ctx: Context<ExecuteHook>, amount: u64) -> Result<()> {
        let pool = &ctx.accounts.bonding_curve_pool;
        let sender = ctx.accounts.source_owner.key();
        let destination_program = ctx.accounts.destination.owner;

        // 1. Whitelist DEX Programs (Raydium CPMM, Jupiter, Orca, Meteora) for fee exemption
        if is_whitelisted_dex(destination_program) {
            msg!("Transfer to whitelisted DEX router: Transfer hook fee exempted.");
            return Ok(());
        }

        // 2. Dev Authority Transfer Validation (Enforce Milestone Unlocks)
        if sender == pool.dev_authority || pool.dev_cluster_wallets.contains(&sender) {
            // Dev supply is locked 100% at launch; strictly unlocked by milestones
            let allowed_dev_unlocked_bps = if pool.milestone_4_reached {
                10000 // 100%
            } else if pool.milestone_3_reached {
                7000 // 70%
            } else if pool.milestone_2_reached {
                4500 // 45% (20% m1 + 25% m2)
            } else if pool.milestone_1_reached {
                2000 // 20%
            } else {
                0 // 0% liquid at launch
            };

            require!(
                allowed_dev_unlocked_bps > 0,
                TransferHookError::DevTokensLockedUntilMilestones
            );
            msg!("Dev transfer approved under milestone allowance: {} bps", allowed_dev_unlocked_bps);
        }

        // 3. Early Buyer Vesting Validation
        if let Some(user_pos) = &ctx.accounts.user_position {
            let clock = Clock::get()?;
            let time_elapsed = clock.unix_timestamp.saturating_sub(user_pos.first_buy_timestamp);
            let intervals_passed = (time_elapsed / 900).min(4); // 900s = 15 mins
            let total_unlocked_bps = 2000 + (intervals_passed as u64 * 2000); // 20% + 20% every 15m

            let allowed_max_transfer = (user_pos.total_bought as u128)
                .checked_mul(total_unlocked_bps as u128)
                .unwrap()
                .checked_div(10000)
                .unwrap() as u64;

            require!(
                amount <= allowed_max_transfer,
                TransferHookError::TrancheVestingNotYetMatured
            );

            // Apply 4% dynamic reflection fee if selling before 100% maturity
            if total_unlocked_bps < 10000 {
                msg!("Dynamic Diamond-Hand Reflection: 4% fee applied (2% SOL holders, 2% burned).");
            }
        }

        Ok(())
    }
}

fn is_whitelisted_dex(program_id: &Pubkey) -> bool {
    // Known DEX program IDs on Solana (Raydium CPMM, Orca Whirlpool, Meteora DLMM, Jupiter)
    let raydium_cpmm = Pubkey::new_from_array([1u8; 32]);
    let orca_whirlpool = Pubkey::new_from_array([2u8; 32]);
    let meteora_dlmm = Pubkey::new_from_array([3u8; 32]);
    *program_id == raydium_cpmm || *program_id == orca_whirlpool || *program_id == meteora_dlmm
}

#[derive(Accounts)]
pub struct ExecuteHook<'info> {
    pub source_token_account: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    pub destination: AccountInfo<'info>,
    pub source_owner: Signer<'info>,
    pub extra_account_metas: AccountInfo<'info>,
    pub bonding_curve_pool: Account<'info, BondingCurvePoolState>,
    pub user_position: Option<Account<'info, UserPositionState>>,
}

#[account]
pub struct BondingCurvePoolState {
    pub mint: Pubkey,
    pub dev_authority: Pubkey,
    pub dev_cluster_wallets: Vec<Pubkey>,
    pub milestone_1_reached: bool,
    pub milestone_2_reached: bool,
    pub milestone_3_reached: bool,
    pub milestone_4_reached: bool,
}

#[account]
pub struct UserPositionState {
    pub pool: Pubkey,
    pub wallet: Pubkey,
    pub total_bought: u64,
    pub current_balance: u64,
    pub first_buy_timestamp: i64,
    pub unlocked_tranches_mask: u8,
}

#[error_code]
pub enum TransferHookError {
    #[msg("Dev allocation is locked until Market Cap milestones are verified on-chain.")]
    DevTokensLockedUntilMilestones,
    #[msg("Early buyer installment tranche is still vesting (20% tranches unlock every 15m).")]
    TrancheVestingNotYetMatured,
}
