use {
    anyhow::{anyhow, Result},
    std::{
        net::SocketAddr,
        sync::Arc,
        time::{SystemTime, UNIX_EPOCH},
    },
    tokio::{
        net::TcpListener,
        sync::{oneshot, Mutex},
    },
};

use crate::{configuration::AppConfig, fetcher::Fetcher, indexer::Indexer};

pub(crate) mod interface;
pub(crate) mod logic;
pub(crate) mod server;
pub(crate) mod state;

use interface::AppExecutor;
pub(crate) use state::AppState;

pub struct App<T: AppExecutor> {
    /// App executor
    pub executor: T,

    /// Current state of the indexer
    pub state: Arc<Mutex<AppState<T::Artifact>>>,

    /// Shutdown sender
    pub shutdown_sender: Option<oneshot::Sender<()>>,

    /// Socket addrss
    pub socket: SocketAddr,
}

impl App<Indexer> {
    pub async fn run_indexer(cfg: AppConfig) -> Result<()> {
        let executor = Indexer::new(&cfg).await?;
        let state = Arc::new(Mutex::new(AppState::Init));
        let socket = get_socket(&cfg).await?;

        let mut app = Self {
            executor,
            state,
            shutdown_sender: None,
            socket,
        };

        app.run().await
    }
}

impl App<Fetcher> {
    pub async fn run_fetcher(cfg: AppConfig) -> Result<()> {
        let executor = Fetcher::new(&cfg).await?;
        let state = Arc::new(Mutex::new(AppState::Init));
        let socket = get_socket(&cfg).await?;

        let mut app = Self {
            executor,
            state,
            shutdown_sender: None,
            socket,
        };

        app.run().await
    }
}

impl<T: AppExecutor> App<T> {
    pub async fn run(&mut self) -> Result<()> {
        self.run_server().await?;
        self.run_executor().await?;

        Ok(())
    }
}

pub async fn get_socket(cfg: &AppConfig) -> Result<SocketAddr> {
    TcpListener::bind(cfg.listener.to_owned())
        .await?
        .local_addr()
        .map_err(|e| anyhow!("Failed start listener: {}", e))
}

pub fn now() -> Result<u64> {
    Ok(SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs())
}
