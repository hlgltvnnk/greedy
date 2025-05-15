use super::DISCRIMINATOR_LENGTH;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Sale {
    /// Account version
    pub version: u8,

    /// Sale UUID
    pub id: u128,

    /// Sale name
    pub name: [u8; 32],

    /// Sale description
    pub description: [u8; 256],

    /// Sale authority
    pub authority: Pubkey,

    /// Sale mint
    pub mint: Pubkey,

    /// Sale start date
    pub start_date: i64,

    /// Sale end date
    pub end_date: i64,

    /// Target amount in sol
    pub target_deposit: u64,

    /// Unlock range
    pub unlock_range: [u16; 2],

    /// Whether the sale is unlocked
    pub is_locked: bool,

    /// Amount of deposited SOL
    pub deposited_amount: u64,

    /// Total greed level for sale
    pub total_greed: u64,

    /// Whether the sale is unlocked
    pub completed: bool,

    /// Featured sale
    pub featured: bool,
}

impl Sale {
    pub const LEN: usize = DISCRIMINATOR_LENGTH + Sale::INIT_SPACE;
    pub const VERSION: u8 = 1;
}

#[account]
#[derive(InitSpace)]
pub struct SaleStats {
    /// Account version
    pub version: u8,

    /// Sale UUID
    pub id: u128,

    /// Sale participant count
    pub participation_count: u64,

    /// Deposit statistics
    pub stats: [u64; 100],
}

impl SaleStats {
    pub const LEN: usize = DISCRIMINATOR_LENGTH + SaleStats::INIT_SPACE;
    pub const VERSION: u8 = 1;
}
