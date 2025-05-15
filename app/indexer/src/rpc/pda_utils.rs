use {anchor_client::solana_sdk::pubkey::Pubkey, uuid::Uuid};

// Greedy accounts:

pub const PUMP_AMM_ID: Pubkey =
    Pubkey::from_str_const("pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA");

/// Returns state PDA address
pub fn get_state_address(program_id: &Pubkey) -> (Pubkey, u8) {
    let seeds = [b"state".as_ref()];
    get_program_account(&seeds, program_id)
}

/// Returns sale PDA address
pub fn get_sale_address(program_id: &Pubkey, id: &Uuid) -> (Pubkey, u8) {
    let seeds = [b"sale".as_ref(), &id.as_u128().to_le_bytes()];
    get_program_account(&seeds, program_id)
}

/// Returns sale mint PDA address
pub fn get_sale_mint_address(program_id: &Pubkey, id: &Uuid) -> (Pubkey, u8) {
    let seeds = [b"sale_mint".as_ref(), &id.as_u128().to_le_bytes()];
    get_program_account(&seeds, program_id)
}

// Pump amm accounts

/// Returns amm global config PDA address
pub fn get_global_config_address() -> (Pubkey, u8) {
    let seeds = [b"global_config".as_ref()];
    get_program_account(&seeds, &PUMP_AMM_ID)
}

/// Returns amm pool PDA address
pub fn get_pool_address(
    index: u16,
    authority: &Pubkey,
    base_mint: &Pubkey,
    quote_mint: &Pubkey,
) -> (Pubkey, u8) {
    let seeds = [
        b"pool".as_ref(),
        &index.to_le_bytes(),
        authority.as_ref(),
        base_mint.as_ref(),
        quote_mint.as_ref(),
    ];
    get_program_account(&seeds, &PUMP_AMM_ID)
}

/// Returns amm lp mint PDA address
pub fn get_lp_mint_address(pool: &Pubkey) -> (Pubkey, u8) {
    let seeds = [b"pool_lp_mint".as_ref(), pool.as_ref()];
    get_program_account(&seeds, &PUMP_AMM_ID)
}

/// Returns amm lp mint PDA address
pub fn get_event_authority_address() -> (Pubkey, u8) {
    let seeds = [b"__event_authority".as_ref()];
    get_program_account(&seeds, &PUMP_AMM_ID)
}

/// Returns PDA address
pub fn get_program_account(seeds: &[&[u8]], program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(seeds, program_id)
}
