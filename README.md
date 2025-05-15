# Greedy Solana

This is an Greedy contract for Solana blockchain.

## Program

### Dependencies

To install everything you need to work with this project, you'll need to install dependencies as described in [Anchor](https://www.anchor-lang.com/docs/installation) documentation.

### Build contract

The source code of attestation program is in ./programs/greedy.
To build the **greedy** program, you need to execute this command:

```sh

anchor build

```

You'll get the following output:

- program binaries at ./target/deploy/greedy.so
- IDL file at ./target/idl/greedy.json
- Typescript typings at ./target/types/greedy.ts

### Deploy

Before deploy:

1. Set cluster in [Anchor.toml](./Anchor.toml)
2. Update program id in declare_id in [contract](./programs/greedy/src/lib.rs)
3. Setup environment like in [example](.example.env)

To deploy the program, run this command:

```sh

anchor deploy \
    --provider.cluster $ANCHOR_PROVIDER_URL \
    --program-keypair $KEYPAIR \
    --program-name greedy \
    --provider.wallet $ANCHOR_WALLET

```

Where:

- ANCHOR_PROVIDER_URL - url of the solana provider
- KEYPAIR - path where contract keys are stored
- ANCHOR_WALLET - path to the wallet keys

### Run tests

To test the **greedy** program, you need to execute this command:

```sh

anchor test -- --features "testing"

```

This command starts a local validator, sets up the program on chain and runs a suite of Jest tests against it.

### Run scripts

Before start setup env file with corresponding variables:

- ANCHOR_PROVIDER_URL - url of solana rpc
- ANCHOR_WALLET - path to wallet to sign transactions
- PROGRAM_ID - public key of Greedy program

Available scripts:

1. To initialize contract state run:

```sh
npm run initialize-contract-state <CONTRACT_OWNER> 
```

2. To set create sale:

```sh
npm run create-sale <OWNER>
```
All sale settings update inside script

3. To participate in sale:

```sh
npm run participate-in-sale <SALE_ID> <AMOUNT> <CLAIM_HOUR>
```

3. To update multiplier:

```sh
npm run update-multiplier <SALE_ID> <AMOUNT> <CLAIM_HOUR>
```

# Greedy Solana backend

Rust backend for interaction with Greedy contract.
Includes 2 services:
- Indexer (for fetching sales)
- Shcheduler (for app creation)

## Setup

It is required to set configuration before start. Define config file in CONFIG_PATH env variable.
Or set env variables - example [here](.env.example).
Configuration file must contain fields:

```toml
log_level                           # Log level for the application layer, default: info
is_json_logging                     # Whether to use JSON logging, default: true
wait_interval_ms                    # The number of milliseconds between wait checks

[rpc]:                              # Rpc configurations
rpc_node_url                        # The RPC node URL
signer                              # Signer keypair
contract_address                    # Greedy Core contract address
fetching_delay                      # The number of milis between fetching iterations
page_size                           # Page size for fetching data

[database]:                         # Signing keypair string
host:                               # Database host
port:                               # Database port
user                                # Database user
password                            # Database password
name                                # Database name
ca_cert                             # Path to database CA certificate file (optional)
run_migrations                      # Run database migrations [default: true]
```

To update migration folder path udpate MIGRATIONS_PATH env.
To run in dev mode - set DEV_MODE env to 1.


## Usage

To run service in indexer mode:

```sh
cargo run indexer
```

To run service in scheduler mode:

```sh
cargo run scheduler
```

## Test locally:

1. Start local validator with Metaplex and Pump amm programs:

```sh
solana-test-validator --reset --url https://api.mainnet-beta.solana.com --clone-upgradeable-program  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s ---clone-upgradeable-program pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA --clone ADyA8hdefvWN2dbGGWFotbzWxrAvLW83WG6QCVXvJKqw
```

2. Build & deploy contract:

```sh
anchor build &&  anchor deploy --program-keypair ./tests/test_keypair.json --program-name greedy
```

3. Start services:

```sh
docker compose up .
```

2. Create sales + participate:

```sh
npm run app-test
```