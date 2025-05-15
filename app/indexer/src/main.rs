use greedy_indexer::{
    app::App, configuration::AppConfig, fetcher::Fetcher, indexer::Indexer,
    observability::init_tracing,
};

use {
    anyhow::Result,
    clap::{command, Parser},
    tracing::info,
};

#[derive(Parser, Debug)]
enum AppMode {
    #[command(about = "Run service in indexer mode")]
    Indexer,
    #[command(about = "Run service in fetcher mode")]
    Scheduler,
}

#[tokio::main]
async fn main() -> Result<()> {
    let mode = AppMode::parse();
    let configuration = AppConfig::load()?;

    init_tracing(&configuration.log_level, configuration.is_json_logging)?;

    info!(
        version = env!("CARGO_PKG_VERSION"),
        "Application started with mode: {:?}", mode
    );

    match mode {
        AppMode::Indexer => App::<Indexer>::run_indexer(configuration).await,
        AppMode::Scheduler => App::<Fetcher>::run_fetcher(configuration).await,
    }
}
