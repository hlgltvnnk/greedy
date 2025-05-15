import {
  PumpAmmSdk,
  sendAndConfirmTransaction,
  transactionFromInstructions,
} from "@pump-fun/pump-swap-sdk";
import {
  web3,
  AnchorProvider,
  setProvider,
  Program,
  workspace,
  BN,
} from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import { PublicKey, Signer } from "@solana/web3.js";

import { errorHandler, logVar, successHandler } from "./util";
import { GreedySolana } from "../target/types/greedy_solana";

import { findProgramDataAddress } from "../tests/util/entity";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

async function main() {
  // Initialize SDK

  console.log("Initializing Pump AMM SDK");
  const pumpAmmSdk = new PumpAmmSdk(
    provider.connection,
    "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
  );

  console.log("Initializing Pump AMM SDK");

  const creator = new PublicKey("2myG54s6aFAsmijW7EB1BhX9rVYRRRYW5mLZRtbdsZFE");
  const baseMint = new PublicKey(
    "7Esdfejnqar8ia5WpLQo3o3fJYiC8W9ZfX77unxEiyZ4"
  );
  const quoteMint = new PublicKey(
    "So11111111111111111111111111111111111111112"
  );

  console.log("Initializing Pump AMM SDK");

  // Create a (base, quote) pool
  const createPoolInstructions = await pumpAmmSdk.createPoolInstructions(
    0,
    creator,
    baseMint,
    quoteMint,
    new BN(200_000_000_000),
    new BN(100_000)
  );

  // Get initial pool price for UI
  const initialPoolPrice = pumpAmmSdk.createAutocompleteInitialPoolPrice(
    new BN(200_000_000_000),
    new BN(100_000)
  );

  console.log("Initializing Pump AMM SDK");

  const recentBlockhash = await provider.connection.getLatestBlockhash();
  console.log("Initializing Pump AMM SDK");

  // Build and send transaction
  let transaction = transactionFromInstructions(
    creator,
    createPoolInstructions,
    recentBlockhash.blockhash,
    [provider.wallet["payer"] as Signer]
  );
  console.log("Initializing Pump AMM SDK");

  transaction.sign([provider.wallet["payer"] as Signer]);

  const serializedTransaction = transaction.serialize();

  console.log("Initializing Pump AMM SDK");

  return await provider.connection.sendRawTransaction(serializedTransaction);
}

main().then(successHandler).catch(errorHandler);
