use anchor_lang::prelude::*;

declare_id!("TRNCHOusterDao111111111111111111111111111111");

pub const DEV_INACTIVITY_THRESHOLD_SECONDS: i64 = 7 * 24 * 3600; // 7 days (604,800 seconds)
pub const QUORUM_PERCENTAGE_BPS: u64 = 6600; // >66% token-weighted quorum

#[program]
pub mod community_ouster_dao {
    use super::*;

    pub fn propose_ouster(
        ctx: Context<ProposeOuster>,
        dev_pubkey: Pubkey,
        squads_multisig: Pubkey,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        // Verify dev inactivity exceeds 7 days
        let inactivity_time = clock.unix_timestamp.saturating_sub(ctx.accounts.bonding_curve_pool.last_dev_active_timestamp);
        require!(
            inactivity_time >= DEV_INACTIVITY_THRESHOLD_SECONDS,
            OusterError::DevNotInactiveForSevenDays
        );

        proposal.dev_authority = dev_pubkey;
        proposal.squads_multisig = squads_multisig;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.total_supply_snapshot = ctx.accounts.bonding_curve_pool.total_supply;
        proposal.voting_deadline = clock.unix_timestamp + (48 * 3600); // 48h voting period
        proposal.is_executed = false;

        msg!("Ouster Proposal Created against dev {} due to >7d inactivity.", dev_pubkey);
        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote_yes: bool,
        token_weight: u64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp <= proposal.voting_deadline, OusterError::VotingPeriodEnded);
        require!(!proposal.is_executed, OusterError::ProposalAlreadyExecuted);

        if vote_yes {
            proposal.yes_votes = proposal.yes_votes.checked_add(token_weight).unwrap();
        } else {
            proposal.no_votes = proposal.no_votes.checked_add(token_weight).unwrap();
        }

        // Check if 66% quorum reached
        let quorum_threshold = (proposal.total_supply_snapshot as u128)
            .checked_mul(QUORUM_PERCENTAGE_BPS as u128)
            .unwrap()
            .checked_div(10000)
            .unwrap() as u64;

        if proposal.yes_votes >= quorum_threshold {
            proposal.is_executed = true;
            msg!("66% Quorum Reached! Dev stripped of locked supply. Authority assigned to Squads Multisig {}", proposal.squads_multisig);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ProposeOuster<'info> {
    #[account(
        init,
        payer = proposer,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 1,
        seeds = [b"ouster_proposal", dev_pubkey.as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    pub bonding_curve_pool: Account<'info, BondingCurveState>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
}

#[account]
pub struct Proposal {
    pub dev_authority: Pubkey,
    pub squads_multisig: Pubkey,
    pub proposer: Pubkey,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub total_supply_snapshot: u64,
    pub voting_deadline: i64,
    pub is_executed: bool,
}

#[account]
pub struct BondingCurveState {
    pub dev_authority: Pubkey,
    pub last_dev_active_timestamp: i64,
    pub total_supply: u64,
}

#[error_code]
pub enum OusterError {
    #[msg("Dev has been active within the last 7 days. Ouster requires >7 days of zero on-chain activity.")]
    DevNotInactiveForSevenDays,
    #[msg("Voting period has ended.")]
    VotingPeriodEnded,
    #[msg("Proposal has already been executed.")]
    ProposalAlreadyExecuted,
}
