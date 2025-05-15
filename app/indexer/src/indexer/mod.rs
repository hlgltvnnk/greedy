use {
    anyhow::{anyhow, Result},
    std::{
        collections::VecDeque,
        time::{Duration, SystemTime, UNIX_EPOCH},
    },
};

use crate::{configuration::AppConfig, database::DatabaseManager, rpc::SolanaClient};

pub(crate) mod cursor;
pub(crate) mod execution;

pub(crate) use crate::app::AppState;
use cursor::{IndexingCursor, IndexingJob};

pub struct Indexer {
    /// Stack of transactions to index
    jobs: VecDeque<IndexingJob>,

    /// The number of milliseconds between wait checks
    wait_interval_ms: Duration,

    /// Client to access blockchain data
    rpc: SolanaClient,

    /// Database client
    database: DatabaseManager,
}

impl Indexer {
    pub async fn new(cfg: &AppConfig) -> Result<Self> {
        let rpc = SolanaClient::new(&cfg.rpc)
            .map_err(|e| anyhow!("Failed to initialize rpc cli: {e}"))?;
        let database = DatabaseManager::new(&cfg.database)
            .await
            .map_err(|e| anyhow!("Failed to initialize db connection: {e}"))?;

        tracing::info!("App initialized");

        Ok(Self {
            wait_interval_ms: cfg.wait_interval_ms,
            jobs: VecDeque::new(),
            rpc,
            database,
        })
    }
}

fn now() -> Result<u64> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
}
