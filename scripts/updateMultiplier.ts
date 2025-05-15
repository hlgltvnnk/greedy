import {
  AnchorProvider,
  setProvider,
  Program,
  workspace,
} from "@coral-xyz/anchor";
import * as dotenv from "dotenv";

import { errorHandler, logVar, successHandler } from "./util";
import { GreedySolana } from "../target/types/greedy_solana";

import { BN } from "bn.js";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

export const DEFAULT_MULTIPLIER = new BN(20);

async function main() {
  const programId = process.env.PROGRAM_ID;

  if (!programId) {
    throw new Error("PROGRAM_ID is not set");
  }

  const program = workspace.GreedySolana as Program<GreedySolana>;

  logVar(`Updating contract state`, programId);

  return await program.methods
    .setContractMultiplier(DEFAULT_MULTIPLIER)
    .accounts({
      authority: provider.publicKey,
    })
    .rpc();
}

main().then(successHandler).catch(errorHandler);
