use {
    anchor_client::anchor_lang::AccountDeserialize,
    anyhow::{anyhow, Result},
    solana_sdk::{commitment_config::CommitmentConfig, pubkey::Pubkey},
    std::str::FromStr,
    tracing::{info, trace},
};

use super::{events::EventName, instruction::DecodedInstruction, EventData, SolanaClient};
use crate::{database::PushPayload, get_pt_account, rpc::events::Sale};

const SALE_ACCOUNT_INDEX: usize = 1;

impl SolanaClient {
    #[tracing::instrument(skip(self))]
    pub(crate) async fn process_job(&self, signature: &str) -> Result<Option<Vec<PushPayload>>> {
        let instructions = self.get_instructions(signature).await?;

        if instructions.is_empty() {
            trace!(hash = signature, "Ignoring transaction");

            return Ok(None);
        }

        info!(signature, "Processing transaction");

        let mut payloads = vec![];

        for instruction in instructions {
            let data = self.get_instruction_data(&instruction).await?;
            info!(
                name = instruction.name.to_string(),
                signature, "Found instruction",
            );

            payloads.push(PushPayload {
                data,
                hash: signature.to_string(),
            });
        }

        Ok(Some(payloads))
    }

    async fn get_instruction_data(&self, instruction: &DecodedInstruction) -> Result<EventData> {
        match instruction.name {
            EventName::CreateSale => {
                let account = get_pubkey(&instruction.account_keys, SALE_ACCOUNT_INDEX)?;
                let sale = get_pt_account!(self, &account, Sale)?;

                tracing::info!(?sale, "Sale fetched");

                Ok(sale.into())
            }
        }
    }

    pub async fn get_account_data<T: AccountDeserialize>(&self, address: &Pubkey) -> Result<T> {
        let mut data: &[u8] = &self
            .rpc_client
            .get_account_with_commitment(address, CommitmentConfig::processed())
            .await?
            .value
            .ok_or(anyhow!("Account not found"))?
            .data;

        T::try_deserialize(&mut data).map_err(|e| anyhow!("Account deserialization error: {e}"))
    }
}

fn get_pubkey(accounts: &[String], index: usize) -> Result<Pubkey> {
    Ok(Pubkey::from_str(
        accounts
            .get(index)
            .ok_or(anyhow::anyhow!("Account {} is absent", index))?,
    )?)
}
