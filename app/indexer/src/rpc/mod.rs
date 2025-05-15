use {
    anchor_client::{Client, Cluster, Program},
    anyhow::{anyhow, Result},
    solana_client::nonblocking::rpc_client::RpcClient,
    solana_sdk::pubkey::Pubkey,
    std::sync::Arc,
    std::{str::FromStr, time::Duration},
    tracing::info,
};

use crate::configuration::RpcConfiguration;

mod decoder;
mod entity_processor;
mod events;
mod fetcher;
mod instruction;
mod job_processor;
mod pda_utils;

pub use events::{EventData, EventName, Sale};
pub use instruction::get_instruction_sighash;

use instruction::{get_sighashes, DISCRIMINATOR_SIZE};
use solana_sdk::{commitment_config::CommitmentConfig, signature::Keypair, signer::Signer};

pub(super) const DEFAULT_TIMEOUT: Duration = Duration::from_secs(10);

pub type GreedyProgram = Program<Arc<Keypair>>;

pub(crate) struct SolanaClient {
    payer: Arc<Keypair>,
    greedy_program: GreedyProgram,
    rpc_client: RpcClient,
    fetching_delay: Duration,
    page_size: usize,
    contract_address: Pubkey,
    pub(crate) hashes: Vec<[u8; DISCRIMINATOR_SIZE]>,
}

impl SolanaClient {
    pub(crate) fn new(cfg: &RpcConfiguration) -> Result<Self> {
        let rpc_client = RpcClient::new_with_timeout_and_commitment(
            cfg.rpc_node_url.clone(),
            DEFAULT_TIMEOUT,
            CommitmentConfig::confirmed(),
        );

        let keypair_bytes: Vec<u8> = serde_json::from_str(&cfg.signer)
            .map_err(|e| anyhow!("Failed to load keypair: {e}"))?;
        let payer = Arc::new(
            Keypair::from_bytes(&keypair_bytes)
                .map_err(|e| anyhow!("Failed to read keypair: {}", e))?,
        );

        info!("Using payer: {}", payer.pubkey().to_string());

        let contract_address = Pubkey::from_str(&cfg.contract_address)?;
        let greedy_program = get_program(cfg, contract_address, payer.clone())?;
        let hashes = get_sighashes();

        info!("Indexing contract: {}", &cfg.contract_address);

        Ok(Self {
            payer,
            greedy_program,
            // TODO: replace this with anchor listener
            rpc_client,
            fetching_delay: cfg.fetching_delay,
            page_size: cfg.page_size,
            contract_address,
            hashes,
        })
    }
}

pub fn get_program(
    cfg: &RpcConfiguration,
    contract_address: Pubkey,
    payer: Arc<Keypair>,
) -> Result<GreedyProgram> {
    let cluster =
        Cluster::from_str(&cfg.rpc_node_url).map_err(|_| anyhow!("Failed to parse cluster"))?;

    let client = Client::new_with_options(cluster, payer, CommitmentConfig::processed());

    let program = client
        .program(contract_address)
        .map_err(|e| anyhow!("Failed to get program: {}", e))?;

    Ok(program)
}

#[macro_export]
macro_rules! get_pt_account {
    ($self:expr, $address:expr, $account:ident) => {
        <$account>::try_from(
            $self
                .get_account_data::<greedy_solana::$account>($address)
                .await?,
        )
    };
}
