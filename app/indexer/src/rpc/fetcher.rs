use {
    crate::indexer::cursor::{IndexingCursor, IndexingJob},
    anyhow::Result,
    solana_client::rpc_client::GetConfirmedSignaturesForAddress2Config,
    solana_sdk::{commitment_config::CommitmentConfig, signature::Signature},
    std::{collections::VecDeque, str::FromStr},
    tokio::time::sleep,
    tracing::{debug, info, instrument, trace},
};

use super::SolanaClient;

pub(crate) struct FetchingArtifacts {
    pub jobs: Vec<IndexingJob>,
    pub cursor: IndexingCursor,
}

impl SolanaClient {
    #[instrument(skip(self))]
    pub(crate) async fn fetch_jobs(
        &self,
        current_cursor: &IndexingCursor,
    ) -> Result<FetchingArtifacts> {
        let signature_cursor = match &current_cursor {
            IndexingCursor::None => None,
            IndexingCursor::Transaction(tx) => Some(Signature::from_str(tx)?),
        };

        info!(
            current_cursor = %current_cursor,
            "Fetching solana jobs"
        );

        let signature_list = self.get_signature_list(signature_cursor).await?;
        info!(count = signature_list.len(), "Found jobs");

        let new_cursor = if let Some(recent) = signature_list.last() {
            IndexingCursor::from(recent.clone())
        } else {
            current_cursor.clone()
        };

        Ok(FetchingArtifacts {
            jobs: signature_list,
            cursor: new_cursor,
        })
    }

    async fn get_signature_list(
        &self,
        signature_cursor: Option<Signature>,
    ) -> Result<Vec<IndexingJob>> {
        let mut recent_tx = None;
        let mut signature_list = VecDeque::new();

        loop {
            let config = GetConfirmedSignaturesForAddress2Config {
                before: recent_tx,
                until: signature_cursor,
                limit: Some(self.page_size),
                commitment: Some(CommitmentConfig::confirmed()),
            };

            debug!(before = ?config.before, until = ?config.until, "Fetching signatures");

            let signature_batch = self
                .rpc_client
                .get_signatures_for_address_with_config(&self.contract_address, config)
                .await?;

            if let Some(recent) = signature_batch.last() {
                recent_tx = Some(Signature::from_str(&recent.signature)?);

                for sign in signature_batch {
                    trace!(
                        tx_hash = sign.signature.to_string(),
                        block = sign.block_time,
                        "Found transaction",
                    );

                    signature_list.push_front(sign.signature.to_string());
                }

                sleep(self.fetching_delay).await;
            } else {
                break;
            }
        }

        Ok(signature_list.into())
    }
}
