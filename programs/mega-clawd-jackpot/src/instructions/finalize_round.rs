use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::JackpotError;
use crate::state::*;

#[derive(Accounts)]
pub struct FinalizeRound<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"jackpot_state"],
        bump = jackpot_state.bump,
    )]
    pub jackpot_state: Account<'info, JackpotState>,

    #[account(
        mut,
        seeds = [b"vault"],
        bump = jackpot_state.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"player_list", jackpot_state.current_round.to_le_bytes().as_ref()],
        bump,
    )]
    pub player_list: Account<'info, PlayerList>,

    #[account(mut)]
    pub winner_usdc_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyback_usdc_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = caller,
        space = RoundResult::SIZE,
        seeds = [b"round_result", jackpot_state.current_round.to_le_bytes().as_ref()],
        bump,
    )]
    pub round_result: Account<'info, RoundResult>,

    #[account(
        init,
        payer = caller,
        space = PlayerList::size(1000),
        seeds = [b"player_list", (jackpot_state.current_round + 1).to_le_bytes().as_ref()],
        bump,
    )]
    pub next_player_list: Account<'info, PlayerList>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<FinalizeRound>) -> Result<()> {
    let state = &mut ctx.accounts.jackpot_state;
    let clock = Clock::get()?;
    let player_list = &ctx.accounts.player_list;

    // Check round is over
    require!(
        clock.unix_timestamp >= state.round_start_time + state.round_duration,
        JackpotError::RoundNotOver
    );
    require!(!player_list.players.is_empty(), JackpotError::NoPlayers);

    let pot = state.pot_balance;
    let winner_prize = pot / 2;
    let buyback_amount = pot - winner_prize;

    // Pseudo-random winner using clock data
    let seed = (clock.unix_timestamp as u64)
        .wrapping_mul(clock.slot)
        .wrapping_add(player_list.players.len() as u64);
    let winner_index = (seed % player_list.players.len() as u64) as usize;
    let winner = player_list.players[winner_index];

    // PDA signer seeds for vault transfers
    let seeds = &[b"jackpot_state".as_ref(), &[state.bump]];
    let signer_seeds = &[&seeds[..]];

    // Transfer prize to winner
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.winner_usdc_account.to_account_info(),
                authority: state.to_account_info(),
            },
            signer_seeds,
        ),
        winner_prize,
    )?;

    // Transfer buyback portion
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.buyback_usdc_account.to_account_info(),
                authority: state.to_account_info(),
            },
            signer_seeds,
        ),
        buyback_amount,
    )?;

    // Record result
    let result = &mut ctx.accounts.round_result;
    result.round = state.current_round;
    result.winner = winner;
    result.winner_prize = winner_prize;
    result.buyback_amount = buyback_amount;
    result.player_count = state.player_count;
    result.end_time = clock.unix_timestamp;

    // Update stats
    state.total_prizes += winner_prize;
    state.total_buybacks += buyback_amount;

    // Reset for next round
    state.current_round += 1;
    state.round_start_time = clock.unix_timestamp;
    state.pot_balance = 0;
    state.player_count = 0;

    // Initialize next player list
    let next_list = &mut ctx.accounts.next_player_list;
    next_list.round = state.current_round;
    next_list.players = Vec::new();

    Ok(())
}
