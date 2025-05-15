use solana_client::rpc_config::RpcTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;

use {
    anyhow::{bail, Result},
    enum_extract::let_extract,
    solana_sdk::signature::Signature,
    solana_transaction_status::{
        EncodedConfirmedTransactionWithStatusMeta, EncodedTransaction, UiCompiledInstruction,
        UiMessage, UiTransactionEncoding,
    },
    std::str::FromStr,
};

use super::{
    events::EventName,
    instruction::{DecodedInstruction, DISCRIMINATOR_SIZE},
    SolanaClient,
};

impl SolanaClient {
    pub(crate) async fn get_instructions(&self, hash: &str) -> Result<Vec<DecodedInstruction>> {
        let tx = self
            .rpc_client
            .get_transaction_with_config(
                &Signature::from_str(hash)?,
                RpcTransactionConfig {
                    commitment: Some(CommitmentConfig::confirmed()),
                    encoding: Some(UiTransactionEncoding::Json),
                    max_supported_transaction_version: None,
                },
            )
            .await?;

        self.decode_transaction(tx)
    }

    fn decode_transaction(
        &self,
        tx: EncodedConfirmedTransactionWithStatusMeta,
    ) -> Result<Vec<DecodedInstruction>> {
        let_extract!(
            EncodedTransaction::Json(json_tx),
            tx.transaction.transaction,
            bail!("Wrong transaction encoding")
        );

        let_extract!(
            UiMessage::Raw(msg),
            json_tx.message,
            bail!("Wrong message encoding")
        );

        if msg.account_keys.is_empty() {
            bail!("Empty transaction accounts")
        }

        let mut result = vec![];
        for instr in msg.instructions.iter() {
            if let Some(instruction) = self.parse_instruction(instr, &msg.account_keys)? {
                result.push(instruction);
            }
        }

        Ok(result)
    }

    fn parse_instruction(
        &self,
        instruction: &UiCompiledInstruction,
        tx_accounts: &[String],
    ) -> Result<Option<DecodedInstruction>> {
        let instruction_program_id = &tx_accounts[instruction.program_id_index as usize];

        if instruction_program_id.eq(&self.contract_address.to_string()) {
            if instruction.accounts.is_empty() {
                bail!("Empty instruction accounts")
            }

            let buf = &bs58::decode(&instruction.data).into_vec()?;
            let sighash = &buf[..DISCRIMINATOR_SIZE];

            let name = if let Some(index) = self.hashes.iter().position(|hash| hash == sighash) {
                EventName::from_index(index)?
            } else {
                return Ok(None);
            };

            let account_keys = instruction
                .accounts
                .iter()
                .map(|&index| tx_accounts[index as usize].clone())
                .collect::<Vec<_>>();

            return Ok(Some(DecodedInstruction { account_keys, name }));
        }

        Ok(None)
    }
}
