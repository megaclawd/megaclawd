use anchor_lang::prelude::*;

#[error_code]
pub enum JackpotError {
    #[msg("Round is not over yet")]
    RoundNotOver,
    #[msg("Player has already entered this round")]
    AlreadyEntered,
    #[msg("No players in the current round")]
    NoPlayers,
    #[msg("Player list is full")]
    PlayerListFull,
}
