use anchor_lang::prelude::*;

#[account]
pub struct JackpotState {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub vault: Pubkey,
    pub buyback_wallet: Pubkey,
    pub current_round: u64,
    pub round_start_time: i64,
    pub round_duration: i64,
    pub pot_balance: u64,
    pub player_count: u32,
    pub total_buybacks: u64,
    pub total_prizes: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

impl JackpotState {
    pub const SIZE: usize = 8 + 32 * 4 + 8 * 5 + 4 + 1 + 1 + 64;
}

#[account]
pub struct PlayerEntry {
    pub player: Pubkey,
    pub round: u64,
    pub timestamp: i64,
    pub bump: u8,
}

impl PlayerEntry {
    pub const SIZE: usize = 8 + 32 + 8 + 8 + 1 + 16;
}

#[account]
pub struct PlayerList {
    pub round: u64,
    pub players: Vec<Pubkey>,
}

impl PlayerList {
    pub fn size(max_players: usize) -> usize {
        8 + 8 + 4 + (32 * max_players)
    }
}

#[account]
pub struct RoundResult {
    pub round: u64,
    pub winner: Pubkey,
    pub winner_prize: u64,
    pub buyback_amount: u64,
    pub player_count: u32,
    pub end_time: i64,
}

impl RoundResult {
    pub const SIZE: usize = 8 + 8 + 32 + 8 + 8 + 4 + 8 + 16;
}
