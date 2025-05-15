use super::DISCRIMINATOR_LENGTH;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Participant {
    /// Sale round version, default to 1
    pub version: u8,

    /// Sale UUID
    pub sale_id: u128,

    /// User wallet account
    pub payer: Pubkey,

    /// User claim hour
    pub claim_hour: u16,

    /// How much the user has deposited
    pub deposited_amount: u64,

    /// User greed level
    pub greed_level: u64,

    /// Whether the user has claimed tokens or recharged SOL
    pub is_claimed: bool,
}

impl Participant {
    pub const LEN: usize = DISCRIMINATOR_LENGTH + Participant::INIT_SPACE;
    pub const VERSION: u8 = 1;
}
