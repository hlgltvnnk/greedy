use {anyhow::Result, async_trait::async_trait, tracing::info, uuid::Uuid};

use super::{AppState, Fetcher};
use crate::{
    app::{interface::AppExecutor, now},
    database::SaleStatus,
};

#[async_trait]
impl AppExecutor for Fetcher {
    type Artifact = Vec<Uuid>;

    #[tracing::instrument(name = "init", skip(self))]
    async fn handle_init(&mut self) -> Result<AppState<Self::Artifact>> {
        Ok(AppState::CheckForUpdates { artifact: vec![] })
    }

    #[tracing::instrument(name = "check_for_updates", skip(self, _artifacts))]
    async fn handle_check_for_updates(
        &mut self,
        _artifacts: Self::Artifact,
    ) -> Result<AppState<Self::Artifact>> {
        let sales = self.database.fetch_sales().await?;

        Ok(AppState::Processing { artifact: sales })
    }

    #[tracing::instrument(name = "process", skip(self, artifacts))]
    async fn handle_process(
        &mut self,
        artifacts: Self::Artifact,
    ) -> Result<AppState<Self::Artifact>> {
        if !artifacts.is_empty() {
            for id in &artifacts {
                info!(%id, "Processing sale");

                let status = self.process_sale(id).await?;

                self.database.update_sale_status(id, status).await?;
            }
        }

        let timestamp = now()? + self.wait_interval_ms.as_secs();

        Ok(AppState::Waiting {
            artifact: vec![],
            until: timestamp,
        })
    }

    async fn shutdown(&mut self) -> Result<()> {
        Ok(())
    }
}

impl Fetcher {
    async fn process_sale(&self, id: &Uuid) -> Result<SaleStatus> {
        let sale = self.rpc.fetch_sale_data(id).await?;

        if sale.completed {
            info!(%id, "Sale is already completed");

            return Ok(SaleStatus::Completed);
        }

        if sale.target_deposit > sale.deposited_amount {
            info!(%id, "Sale has low deposit: {} < {}", sale.deposited_amount, sale.target_deposit);

            return Ok(SaleStatus::Closed);
        }

        match self.rpc.complete_sale(id).await {
            Ok(()) => {
                info!(%id, "Sale completed");
                Ok(SaleStatus::Completed)
            }
            Err(e) => {
                info!(%id, "Failed to complete sale: {e}");
                Ok(SaleStatus::Failed)
            }
        }
    }
}
