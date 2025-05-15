#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use context::*;

mod context;
mod errors;
mod state;

pub use state::sale::Sale;

declare_id!("GREEd3qyRDkKMeWZ6Kw7pf1FvcgBdNgpJQ7oxQ7Sq4H3");

#[program]
pub mod greedy_solana {
    use super::*;

    pub fn initialize_contract_state(
        ctx: Context<InitializeContractState>,
        authority: Pubkey,
        multiplier: u64,
        fee: u64,
    ) -> Result<()> {
        ctx.accounts
            .initialize_contract_state(authority, multiplier, fee)
    }

    pub fn set_contract_authority(
        ctx: Context<UpdateContractState>,
        authority: Pubkey,
    ) -> Result<()> {
        ctx.accounts.set_authority(authority)
    }

    pub fn set_contract_multiplier(
        ctx: Context<UpdateContractState>,
        multiplier: u64,
    ) -> Result<()> {
        ctx.accounts.set_multiplier(multiplier)
    }

    pub fn set_contract_fee(ctx: Context<UpdateContractState>, fee: u64) -> Result<()> {
        ctx.accounts.set_fee(fee)
    }

    pub fn update_sale(
        ctx: Context<UpdateSale>,
        sale_id: u128,
        target_deposit: u64,
        description: [u8; 256],
        name: [u8; 32],
        end_date: i64,
        unlock_range: [u16; 2],
    ) -> Result<()> {
        ctx.accounts.update_sale(
            sale_id,
            target_deposit,
            description,
            name,
            end_date,
            unlock_range,
        )
    }

    pub fn create_sale(
        ctx: Context<CreateSale>,
        sale_id: u128,
        args: CreateSaleArgs,
    ) -> Result<()> {
        ctx.accounts.create_sale(sale_id, args, ctx.bumps.mint)
    }

    pub fn update_sale_name(ctx: Context<UpdateSale>, sale_id: u128, name: [u8; 32]) -> Result<()> {
        ctx.accounts.update_sale_name(sale_id, name)
    }

    pub fn update_sale_description(
        ctx: Context<UpdateSale>,
        sale_id: u128,
        description: [u8; 256],
    ) -> Result<()> {
        ctx.accounts.update_sale_description(sale_id, description)
    }

    pub fn update_sale_end_date(
        ctx: Context<UpdateSale>,
        sale_id: u128,
        end_date: i64,
    ) -> Result<()> {
        ctx.accounts.update_sale_end_date(sale_id, end_date)
    }

    pub fn update_mint_metadata_date(
        ctx: Context<UpdateMintMetadata>,
        sale_id: u128,
        args: MetadataArgs,
    ) -> Result<()> {
        ctx.accounts.update_metadata(sale_id, args, ctx.bumps.mint)
    }

    pub fn update_sale_unlock_range(
        ctx: Context<UpdateSale>,
        sale_id: u128,
        unlock_range: [u16; 2],
    ) -> Result<()> {
        ctx.accounts.update_sale_unlock_range(sale_id, unlock_range)
    }

    pub fn update_sale_target_deposit(
        ctx: Context<UpdateSale>,
        sale_id: u128,
        target_deposit: u64,
    ) -> Result<()> {
        ctx.accounts
            .update_sale_target_deposit(sale_id, target_deposit)
    }

    pub fn complete_sale(ctx: Context<CompleteSale>, sale_id: u128) -> Result<()> {
        ctx.accounts.complete_sale(sale_id, ctx.bumps.sale)
    }

    pub fn create_amm(ctx: Context<CreateAmm>, sale_id: u128) -> Result<()> {
        ctx.accounts.create_amm(sale_id)
    }

    pub fn participate_in_sale(
        ctx: Context<ParticipateInSale>,
        sale_id: u128,
        amount: u64,
        claim_hour: u16,
    ) -> Result<()> {
        ctx.accounts
            .participate_in_sale(sale_id, amount, claim_hour)
    }

    pub fn claim_sale_reward(ctx: Context<ClaimSaleReward>, sale_id: u128) -> Result<()> {
        ctx.accounts.claim_sale_reward(sale_id, ctx.bumps.sale)
    }

    pub fn recharge(ctx: Context<Recharge>, sale_id: u128) -> Result<()> {
        ctx.accounts.racharge(sale_id)
    }
}
