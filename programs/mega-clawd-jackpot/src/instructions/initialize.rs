use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = JackpotState::SIZE,
        seeds = [b"jackpot_state"],
        bump,
    )]
    pub jackpot_state: Account<'info, JackpotState>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = jackpot_state,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        space = PlayerList::size(1000),
        seeds = [b"player_list", 1u64.to_le_bytes().as_ref()],
        bump,
    )]
    pub player_list: Account<'info, PlayerList>,

    /// CHECK: Buyback destination wallet
    pub buyback_wallet: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>, round_duration: i64) -> Result<()> {
    let state = &mut ctx.accounts.jackpot_state;
    let clock = Clock::get()?;

    state.authority = ctx.accounts.authority.key();
    state.usdc_mint = ctx.accounts.usdc_mint.key();
    state.vault = ctx.accounts.vault.key();
    state.buyback_wallet = ctx.accounts.buyback_wallet.key();
    state.current_round = 1;
    state.round_start_time = clock.unix_timestamp;
    state.round_duration = round_duration;
    state.pot_balance = 0;
    state.player_count = 0;
    state.total_buybacks = 0;
    state.total_prizes = 0;
    state.bump = ctx.bumps.jackpot_state;
    state.vault_bump = ctx.bumps.vault;

    let player_list = &mut ctx.accounts.player_list;
    player_list.round = 1;
    player_list.players = Vec::new();

    Ok(())
}
