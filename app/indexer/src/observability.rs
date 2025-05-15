use {
    anyhow::{anyhow, Result},
    std::env,
    tracing::subscriber,
    tracing_subscriber::fmt::Subscriber,
};

pub fn init_tracing(log_level: &str, is_json_logging: bool) -> Result<()> {
    let dev_mode: u8 = env::var("DEV_MODE")
        .unwrap_or_else(|_| 0.to_string())
        .parse()?;

    if dev_mode == 1 {
        tracing_subscriber::fmt()
            .with_max_level(tracing::Level::INFO)
            .with_target(true)
            .init();

        return Ok(());
    }

    let builder = Subscriber::builder()
        .with_max_level(log_level.parse().unwrap_or(tracing::Level::INFO))
        .with_writer(std::io::stdout);

    let result = if is_json_logging {
        subscriber::set_global_default(builder.json().flatten_event(true).finish())
    } else {
        subscriber::set_global_default(builder.with_ansi(false).finish())
    };

    result.map_err(|e| anyhow!("Failed to set up tracing subscriber: {:?}", e))
}
