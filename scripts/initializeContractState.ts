import {
  web3,
  AnchorProvider,
  setProvider,
  Program,
  workspace,
  BN,
} from "@coral-xyz/anchor";
import * as dotenv from "dotenv";

import { errorHandler, logVar, successHandler } from "./util";
import { GreedySolana } from "../target/types/greedy_solana";
import { PublicKey, Signer } from "@solana/web3.js";

import {
  findContractStateAddress,
  findProgramDataAddress,
} from "../tests/util/entity";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

export const DEFAULT_MULTIPLIER = new BN(20);
export const DEFAULT_FEE = new BN(2);

async function main() {
  const programId = process.env.PROGRAM_ID;

  if (!programId) {
    throw new Error("PROGRAM_ID is not set");
  }

  const program = workspace.GreedySolana as Program<GreedySolana>;

  const [programData] = findProgramDataAddress();

  const authority = program.provider.publicKey;

  logVar(`Initializing contract state`, programId);
  logVar(`Contract owner`, authority);

  return await program.methods
    .initializeContractState(authority, DEFAULT_MULTIPLIER, DEFAULT_FEE)
    .accounts({
      authority: provider.publicKey,
      programData,
    })
    .rpc();
}

main().then(successHandler).catch(errorHandler);
