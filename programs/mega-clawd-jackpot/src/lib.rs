use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod mega_clawd_jackpot {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, round_duration: i64) -> Result<()> {
        instructions::initialize::handler(ctx, round_duration)
    }

    pub fn enter(ctx: Context<Enter>) -> Result<()> {
        instructions::enter::handler(ctx)
    }

    pub fn finalize_round(ctx: Context<FinalizeRound>) -> Result<()> {
        instructions::finalize_round::handler(ctx)
    }
}
