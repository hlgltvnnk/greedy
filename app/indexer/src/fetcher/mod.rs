use {
    anyhow::{anyhow, Result},
    tokio::time::Duration,
};

use crate::{configuration::AppConfig, database::DatabaseManager, rpc::SolanaClient};

pub(crate) mod execution;
pub(crate) use crate::app::AppState;

pub struct Fetcher {
    /// Client to access blockchain data
    rpc: SolanaClient,

    /// Database client
    database: DatabaseManager,

    /// The number of milliseconds between wait checks
    wait_interval_ms: Duration,
}

impl Fetcher {
    pub async fn new(cfg: &AppConfig) -> Result<Self> {
        let rpc = SolanaClient::new(&cfg.rpc)
            .map_err(|e| anyhow!("Failed to initialize rpc cli: {e}"))?;
        let database = DatabaseManager::new(&cfg.database)
            .await
            .map_err(|e| anyhow!("Failed to initialize db connection: {e}"))?;

        tracing::info!("App initialized");

        Ok(Self {
            rpc,
            database,
            wait_interval_ms: cfg.wait_interval_ms,
        })
    }
}
