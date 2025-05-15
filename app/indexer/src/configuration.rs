use {
    config::{Case, Config, ConfigError, Environment, File, FileFormat},
    serde::Deserialize,
    serde_with::{serde_as, DurationMilliSeconds},
    std::{env, time::Duration},
};

pub const CONFIG_PATH: &str = "configuration.toml";

#[serde_as]
#[derive(Deserialize, Clone)]
pub struct AppConfig {
    /// Log level for the application layer
    #[serde(default = "default_loglevel")]
    pub log_level: String,

    /// Whether to use JSON logging
    #[serde(default = "default_is_json_logging")]
    pub is_json_logging: bool,

    /// The number of milliseconds between wait checks
    #[serde_as(as = "DurationMilliSeconds<u64>")]
    #[serde(default = "default_wait_tick")]
    pub wait_interval_ms: Duration,

    /// The address to listen on
    #[serde(default = "default_listener")]
    pub listener: String,

    pub rpc: RpcConfiguration,

    pub database: DatabaseConfig,
}

#[serde_as]
#[derive(Deserialize, Clone)]
pub struct RpcConfiguration {
    /// The RPC node URL
    pub rpc_node_url: String,

    /// Signer keypair
    pub signer: String,

    /// Greedy Core contract address
    pub contract_address: String,

    /// The number of milliseconds between iterations in the fetching
    #[serde_as(as = "DurationMilliSeconds<u64>")]
    #[serde(default = "default_delay")]
    pub fetching_delay: Duration,

    /// The page size for fetching data
    #[serde(default = "default_page_size")]
    pub page_size: usize,
}

#[derive(Deserialize, Clone)]
pub struct DatabaseConfig {
    /// Database host
    pub host: String,

    /// Database port
    pub port: String,

    /// Database user
    pub user: String,

    /// Database password
    pub password: Option<String>,

    /// Database name
    pub name: String,

    /// Path to database CA certificate file
    pub ca_cert: Option<String>,

    /// Run database migrations
    #[serde(default = "default_run_migrations")]
    pub run_migrations: bool,
}

impl AppConfig {
    pub fn load() -> Result<Self, ConfigError> {
        let config_path = env::var("CONFIG_PATH").unwrap_or_else(|_| CONFIG_PATH.to_string());

        let settings = Config::builder()
            .add_source(
                File::with_name(&config_path)
                    .format(FileFormat::Toml)
                    .required(false),
            )
            .add_source(
                Environment::with_convert_case(Case::Snake)
                    .separator("__")
                    .try_parsing(true)
                    .ignore_empty(true),
            )
            .build()?;

        settings.try_deserialize::<Self>()
    }
}

impl DatabaseConfig {
    pub fn get_connection_string(&self) -> String {
        let mut str = format!("postgres://{}", self.user);

        if let Some(password) = &self.password {
            str.push_str(&format!(":{}", password));
        }

        str.push_str(&format!("@{}:{}/{}", self.host, self.port, self.name));

        if let Some(ca_cert) = &self.ca_cert {
            str.push_str(&format!("?sslmode=require&sslrootcert={}", ca_cert));
        }

        str
    }
}

fn default_is_json_logging() -> bool {
    true
}

fn default_loglevel() -> String {
    String::from("info")
}

fn default_wait_tick() -> Duration {
    Duration::from_secs(5)
}

fn default_delay() -> Duration {
    Duration::from_millis(100)
}

fn default_page_size() -> usize {
    500
}

fn default_run_migrations() -> bool {
    true
}

fn default_listener() -> String {
    String::from("0.0.0.0:3000")
}
