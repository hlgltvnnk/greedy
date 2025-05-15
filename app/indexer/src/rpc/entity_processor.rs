use {
    anchor_spl::{
        associated_token,
        associated_token::{
            get_associated_token_address, get_associated_token_address_with_program_id,
        },
        token, token_2022,
    },
    anyhow::Result,
    greedy_solana::{accounts, instruction, Sale},
    solana_sdk::{pubkey::Pubkey, system_program, transaction::Transaction},
    tracing::info,
    uuid::Uuid,
};

use super::{
    pda_utils::{
        get_event_authority_address, get_global_config_address, get_lp_mint_address,
        get_pool_address, get_sale_address, get_sale_mint_address, get_state_address, PUMP_AMM_ID,
    },
    SolanaClient,
};

pub const WRAPPED_SOL_MINT: Pubkey =
    Pubkey::from_str_const("So11111111111111111111111111111111111111112");

impl SolanaClient {
    #[tracing::instrument(skip(self))]
    pub(crate) async fn complete_sale(&self, id: &Uuid) -> Result<()> {
        let authority = self.greedy_program.payer();
        let (state, _) = get_state_address(&self.contract_address);
        let (sale, _) = get_sale_address(&self.contract_address, id);
        let (sale_mint, _) = get_sale_mint_address(&self.contract_address, id);
        let sale_token_account = get_associated_token_address(&sale, &sale_mint);
        let authority_token_account = get_associated_token_address(&authority, &sale_mint);
        let authority_wsol_token_account =
            get_associated_token_address(&authority, &WRAPPED_SOL_MINT);

        let mut complete_ix = self
            .greedy_program
            .request()
            .accounts(accounts::CompleteSale {
                authority,
                state,
                sale,
                sale_mint,
                wsol_mint: WRAPPED_SOL_MINT,
                sale_token_account,
                authority_token_account,
                authority_wsol_token_account,
                system_program: system_program::id(),
                token_program: token::ID,
                associated_token_program: associated_token::ID,
            })
            .args(instruction::CompleteSale {
                sale_id: id.as_u128(),
            })
            .instructions()?;

        let (pool, _) = get_pool_address(0, &authority, &sale_mint, &WRAPPED_SOL_MINT);
        let (config, _) = get_global_config_address();
        let (lp_mint, _) = get_lp_mint_address(&pool);
        let (event_authority, _) = get_event_authority_address();

        let authority_pool_token_account =
            get_associated_token_address_with_program_id(&authority, &lp_mint, &token_2022::ID);
        let pool_base_token_account = get_associated_token_address(&pool, &sale_mint);
        let pool_quote_token_account = get_associated_token_address(&pool, &WRAPPED_SOL_MINT);

        let mut amm_ix = self
            .greedy_program
            .request()
            .accounts(accounts::CreateAmm {
                authority,
                sale,
                state,
                pool,
                config,
                base_mint: sale_mint,
                quote_mint: WRAPPED_SOL_MINT,
                lp_mint,
                authority_base_token_account: authority_token_account,
                authority_quote_token_account: authority_wsol_token_account,
                authority_pool_token_account,
                pool_base_token_account,
                pool_quote_token_account,
                event_authority,
                system_program: system_program::id(),
                token_program: token::ID,
                token2022_program: token_2022::ID,
                associated_token_program: associated_token::ID,
                amm_program: PUMP_AMM_ID,
            })
            .args(instruction::CreateAmm {
                sale_id: id.as_u128(),
            })
            .instructions()?;

        complete_ix.append(&mut amm_ix);

        let blockhash = self.greedy_program.rpc().get_latest_blockhash().await?;
        let tx = Transaction::new_signed_with_payer(
            &complete_ix,
            Some(&authority),
            &[self.payer.as_ref()],
            blockhash,
        );

        let signature = self
            .greedy_program
            .rpc()
            .send_and_confirm_transaction(&tx)
            .await?;

        info!(
            signature = signature.to_string(), pool = %pool,
            "Amm created",
        );

        Ok(())
    }

    pub(crate) async fn fetch_sale_data(&self, id: &Uuid) -> Result<Sale> {
        let (sale, _) = get_sale_address(&self.contract_address, id);
        let data = self.greedy_program.account(sale).await?;

        Ok(data)
    }
}
