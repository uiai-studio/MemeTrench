use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface};

declare_id!("TRNCHBndingCurve11111111111111111111111111111");

pub const DEV_SUPPLY_HARDCAP_BPS: u64 = 150; // 1.5% max
pub const DEV_GOOD_FAITH_BOND_LAMPORTS: u64 = 2_000_000_000; // 2 SOL
pub const CREATION_FEE_LAMPORTS: u64 = 500_000_000; // 0.5 SOL
pub const FLOOR_FEE_BPS: u64 = 25; // 0.25% trading volume
pub const RAYDIUM_GRADUATION_TARGET_LAMPORTS: u64 = 85_000_000_000; // 85 SOL ($300k MC target)

#[program]
pub mod tranche_bonding_curve {
    use super::*;

    pub fn initialize_curve(
        ctx: Context<InitializeCurve>,
        name: String,
        symbol: String,
        uri: String,
        dev_allocation_bps: u64,
        dev_cluster_wallets: Vec<Pubkey>,
    ) -> Result<()> {
        require!(
            dev_allocation_bps <= DEV_SUPPLY_HARDCAP_BPS,
            ErrorCode::DevAllocationExceedsHardcap
        );
        require!(
            dev_cluster_wallets.len() <= 6,
            ErrorCode::DevClusterExceedsMaxWallets
        );

        let pool = &mut ctx.accounts.bonding_curve_pool;
        pool.mint = ctx.accounts.mint.key();
        pool.dev_authority = ctx.accounts.dev_authority.key();
        pool.virtual_sol_reserve = 30_000_000_000; // 30 SOL virtual reserve
        pool.virtual_token_reserve = 1_073_000_000_000_000; // 1.073B tokens virtual
        pool.real_sol_reserve = 0;
        pool.real_token_reserve = 800_000_000_000_000;
        pool.total_supply = 1_000_000_000_000_000; // 1 Billion tokens with 6 decimals
        pool.dev_allocation_bps = dev_allocation_bps;
        pool.dev_cluster_wallets = dev_cluster_wallets;
        pool.creation_timestamp = Clock::get()?.unix_timestamp;
        pool.last_dev_active_timestamp = Clock::get()?.unix_timestamp;
        pool.is_graduated = false;
        pool.milestone_1_reached = false;
        pool.milestone_2_reached = false;
        pool.milestone_3_reached = false;
        pool.milestone_4_reached = false;
        pool.bump = ctx.bumps.bonding_curve_pool;

        // Escrow 2 SOL dev good faith bond + 50% creation fee to floor vault
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.dev_authority.to_account_info(),
                to: ctx.accounts.reserve_vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(
            cpi_context,
            DEV_GOOD_FAITH_BOND_LAMPORTS + (CREATION_FEE_LAMPORTS / 2),
        )?;

        msg!("TrancheLaunch Bonding Curve Initialized for {}", symbol);
        Ok(())
    }

    pub fn swap_buy(ctx: Context<SwapBuy>, sol_amount_in: u64) -> Result<()> {
        let pool = &mut ctx.accounts.bonding_curve_pool;
        require!(!pool.is_graduated, ErrorCode::CurveAlreadyGraduated);
        require!(sol_amount_in > 0, ErrorCode::ZeroAmount);

        // 0.25% fee to floor insurance vault
        let floor_fee = sol_amount_in
            .checked_mul(FLOOR_FEE_BPS)
            .unwrap()
            .checked_div(10000)
            .unwrap();
        let net_sol = sol_amount_in.checked_sub(floor_fee).unwrap();

        // Constant product formula x * y = k
        let k = (pool.virtual_sol_reserve as u128)
            .checked_mul(pool.virtual_token_reserve as u128)
            .unwrap();
        let new_sol_reserve = (pool.virtual_sol_reserve as u128)
            .checked_add(net_sol as u128)
            .unwrap();
        let new_token_reserve = k.checked_div(new_sol_reserve).unwrap();
        let tokens_out = (pool.virtual_token_reserve as u128)
            .checked_sub(new_token_reserve)
            .unwrap() as u64;

        pool.virtual_sol_reserve = new_sol_reserve as u64;
        pool.virtual_token_reserve = new_token_reserve as u64;
        pool.real_sol_reserve = pool.real_sol_reserve.checked_add(net_sol).unwrap();
        pool.real_token_reserve = pool.real_token_reserve.checked_sub(tokens_out).unwrap();

        // Transfer SOL from buyer to pool
        let cpi_transfer = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.reserve_vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_transfer, sol_amount_in)?;

        // Update User Position (First 1,000 early buyer vesting)
        let pos = &mut ctx.accounts.user_position;
        let clock = Clock::get()?;
        if pos.total_bought == 0 {
            pos.first_buy_timestamp = clock.unix_timestamp;
            pos.unlocked_tranches_mask = 0b00001; // 20% immediate unlock
            pos.total_bought = tokens_out;
            pos.current_balance = tokens_out;
        } else {
            pos.total_bought = pos.total_bought.checked_add(tokens_out).unwrap();
            pos.current_balance = pos.current_balance.checked_add(tokens_out).unwrap();
        }

        // Check Raydium Graduation condition (85 SOL)
        if pool.real_sol_reserve >= RAYDIUM_GRADUATION_TARGET_LAMPORTS {
            pool.is_graduated = true;
            pool.milestone_2_reached = true;
            msg!("Raydium Graduation Target Reached! Ready for CPMM Migration.");
        }

        Ok(())
    }

    pub fn swap_sell(ctx: Context<SwapSell>, token_amount_in: u64) -> Result<()> {
        let pool = &mut ctx.accounts.bonding_curve_pool;
        require!(!pool.is_graduated, ErrorCode::CurveAlreadyGraduated);
        require!(token_amount_in > 0, ErrorCode::ZeroAmount);

        let pos = &mut ctx.accounts.user_position;
        require!(
            pos.current_balance >= token_amount_in,
            ErrorCode::InsufficientBalance
        );

        // Constant product sell math
        let k = (pool.virtual_sol_reserve as u128)
            .checked_mul(pool.virtual_token_reserve as u128)
            .unwrap();
        let new_token_reserve = (pool.virtual_token_reserve as u128)
            .checked_add(token_amount_in as u128)
            .unwrap();
        let new_sol_reserve = k.checked_div(new_token_reserve).unwrap();
        let sol_out = (pool.virtual_sol_reserve as u128)
            .checked_sub(new_sol_reserve)
            .unwrap() as u64;

        pool.virtual_sol_reserve = new_sol_reserve as u64;
        pool.virtual_token_reserve = new_token_reserve as u64;
        pool.real_sol_reserve = pool.real_sol_reserve.checked_sub(sol_out).unwrap();
        pool.real_token_reserve = pool.real_token_reserve.checked_add(token_amount_in).unwrap();
        pos.current_balance = pos.current_balance.checked_sub(token_amount_in).unwrap();

        // Transfer SOL back to seller
        let pool_key = pool.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"bonding_curve_pool",
            pool.mint.as_ref(),
            &[pool.bump],
        ]];

        **ctx.accounts.reserve_vault.to_account_info().try_borrow_mut_lamports()? -= sol_out;
        **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += sol_out;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, symbol: String, uri: String, dev_allocation_bps: u64, dev_cluster_wallets: Vec<Pubkey>)]
pub struct InitializeCurve<'info> {
    #[account(
        init,
        payer = dev_authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + (32 * 6) + 8 + 8 + 1 + 1 + 1 + 1 + 1 + 1,
        seeds = [b"bonding_curve_pool", mint.key().as_ref()],
        bump
    )]
    pub bonding_curve_pool: Account<'info, BondingCurvePool>,
    #[account(
        init,
        payer = dev_authority,
        space = 8,
        seeds = [b"reserve_vault", bonding_curve_pool.key().as_ref()],
        bump
    )]
    /// CHECK: PDA SOL Vault
    pub reserve_vault: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub dev_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapBuy<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve_pool", bonding_curve_pool.mint.as_ref()],
        bump = bonding_curve_pool.bump
    )]
    pub bonding_curve_pool: Account<'info, BondingCurvePool>,
    #[account(
        mut,
        seeds = [b"reserve_vault", bonding_curve_pool.key().as_ref()],
        bump
    )]
    /// CHECK: PDA Vault
    pub reserve_vault: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"user_position", bonding_curve_pool.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapSell<'info> {
    #[account(
        mut,
        seeds = [b"bonding_curve_pool", bonding_curve_pool.mint.as_ref()],
        bump = bonding_curve_pool.bump
    )]
    pub bonding_curve_pool: Account<'info, BondingCurvePool>,
    #[account(
        mut,
        seeds = [b"reserve_vault", bonding_curve_pool.key().as_ref()],
        bump
    )]
    /// CHECK: PDA Vault
    pub reserve_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"user_position", bonding_curve_pool.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BondingCurvePool {
    pub mint: Pubkey,
    pub dev_authority: Pubkey,
    pub virtual_sol_reserve: u64,
    pub virtual_token_reserve: u64,
    pub real_sol_reserve: u64,
    pub real_token_reserve: u64,
    pub total_supply: u64,
    pub dev_allocation_bps: u64,
    pub dev_cluster_wallets: Vec<Pubkey>,
    pub creation_timestamp: i64,
    pub last_dev_active_timestamp: i64,
    pub is_graduated: bool,
    pub milestone_1_reached: bool,
    pub milestone_2_reached: bool,
    pub milestone_3_reached: bool,
    pub milestone_4_reached: bool,
    pub bump: u8,
}

#[account]
pub struct UserPosition {
    pub pool: Pubkey,
    pub wallet: Pubkey,
    pub total_bought: u64,
    pub current_balance: u64,
    pub first_buy_timestamp: i64,
    pub unlocked_tranches_mask: u8, // bitmask for 5 tranches (20% each)
}

#[error_code]
pub enum ErrorCode {
    #[msg("Dev allocation exceeds the strict 1.5% protocol hardcap.")]
    DevAllocationExceedsHardcap,
    #[msg("Dev cluster wallets cannot exceed 6 addresses.")]
    DevClusterExceedsMaxWallets,
    #[msg("Bonding curve pool has already graduated to Raydium.")]
    CurveAlreadyGraduated,
    #[msg("Swap amount must be greater than zero.")]
    ZeroAmount,
    #[msg("Insufficient token balance.")]
    InsufficientBalance,
}
