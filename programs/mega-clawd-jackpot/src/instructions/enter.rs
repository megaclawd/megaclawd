use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::JackpotError;
use crate::state::*;

const ENTRY_AMOUNT: u64 = 1_000_000; // 1 USDC (6 decimals)

#[derive(Accounts)]
pub struct Enter<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"jackpot_state"],
        bump = jackpot_state.bump,
    )]
    pub jackpot_state: Account<'info, JackpotState>,

    #[account(
        mut,
        token::mint = jackpot_state.usdc_mint,
        token::authority = player,
    )]
    pub player_usdc_account: Account<'info, TokenAccount>,

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

    #[account(
        init,
        payer = player,
        space = PlayerEntry::SIZE,
        seeds = [
            b"player_entry",
            jackpot_state.current_round.to_le_bytes().as_ref(),
            player.key().as_ref(),
        ],
        bump,
    )]
    pub player_entry: Account<'info, PlayerEntry>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Enter>) -> Result<()> {
    let state = &mut ctx.accounts.jackpot_state;
    let clock = Clock::get()?;

    // Transfer 1 USDC from player to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.player_usdc_account.to_account_info(),
        to: ctx.accounts.vault.to_account_info(),
        authority: ctx.accounts.player.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        ENTRY_AMOUNT,
    )?;

    // Record player in list
    let player_list = &mut ctx.accounts.player_list;
    require!(player_list.players.len() < 1000, JackpotError::PlayerListFull);
    player_list.players.push(ctx.accounts.player.key());

    // Record individual entry PDA
    let entry = &mut ctx.accounts.player_entry;
    entry.player = ctx.accounts.player.key();
    entry.round = state.current_round;
    entry.timestamp = clock.unix_timestamp;
    entry.bump = ctx.bumps.player_entry;

    state.pot_balance += ENTRY_AMOUNT;
    state.player_count += 1;

    Ok(())
}
