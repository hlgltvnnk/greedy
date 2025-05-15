use anchor_lang::{prelude::Pubkey, solana_program::native_token::LAMPORTS_PER_SOL};

pub const SCALE: u64 = 100;
pub const UUID_VERSION: usize = 4;

#[cfg(feature = "testing")]
pub const SECONDS_PER_HOUR: i64 = 1; // Only for testing

// TODO: remove this when testing is done
#[cfg(not(feature = "testing"))]
pub const SECONDS_PER_HOUR: i64 = 120; // 2 min
                                       // pub const SECONDS_PER_HOUR: i64 = 60 * 60;

pub const DEFAULT_MINT_DECIMALS: u8 = 9;
// TODO: replace with 10 ^ DEFAULT_MINT_DECIMALS
pub const DEFAULT_SUPPLY: u64 = 100_000_000 * LAMPORTS_PER_SOL;
const DEFAULT_COMPLETION_PERCENTAGE: u64 = 80;
pub const COMPLETION_AMOUNT: u64 = DEFAULT_SUPPLY * DEFAULT_COMPLETION_PERCENTAGE / 100;

pub const MIN_UNLOCK_RANGE: u16 = 1; // 1 hour
pub const MAX_UNLOCK_RANGE: u16 = 100; // 100 hours

pub const _MIN_MULTIPLIER: u16 = 1; // 1 hour
pub const _MAX_MULTIPLIER: u16 = 100; // 100 hours

// TODO: remove this when testing is done
pub const MIN_TARGET_AMOUNT: u64 = LAMPORTS_PER_SOL / 10; // 0.1 SOL
                                                          // pub const MIN_TARGET_AMOUNT: u64 = LAMPORTS_PER_SOL; // 5 SOL

pub const MIN_AMOUNT: u64 = LAMPORTS_PER_SOL / 10000 * 75; // 0,0075 SOL
pub const MAX_AMOUNT: u64 = 100 * LAMPORTS_PER_SOL; // 100 SOL

pub const WRAPPED_SOL_MINT: Pubkey =
    Pubkey::from_str_const("So11111111111111111111111111111111111111112");
