use super::{ACCOUNT_RESERVE_SPACE, DISCRIMINATOR_LENGTH};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct State {
    /// Account version
    pub version: u8,

    /// Contract authority
    pub authority: Pubkey,

    /// Multiplier coefficient
    pub multiplier: u64,

    /// Platform fee
    pub fee: u64,
}

impl State {
    pub const LEN: usize = DISCRIMINATOR_LENGTH + ACCOUNT_RESERVE_SPACE + State::INIT_SPACE;
    pub const VERSION: u8 = 1;
}
