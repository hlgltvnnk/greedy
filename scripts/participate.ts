import {
  AnchorProvider,
  setProvider,
  Program,
  workspace,
  BN,
} from "@coral-xyz/anchor";
import * as dotenv from "dotenv";

import { errorHandler, logVar, successHandler } from "./util";
import { GreedySolana } from "../target/types/greedy_solana";

import { ONE_SOL, uuidToBn } from "../tests/util/setup";
import { findSaleAddress } from "../tests/util/entity";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

async function main() {
  const [ID] = process.argv.slice(2);
  const programId = process.env.PROGRAM_ID;

  if (!ID) {
    throw new Error(`Usage: npm run participate <ID>`);
  }

  if (!programId) {
    throw new Error("PROGRAM_ID is not set");
  }

  const program = workspace.GreedySolana as Program<GreedySolana>;
  const id = uuidToBn(ID);

  const saleAddress = await findSaleAddress(id);

  logVar(`Participating in sale with id`, id.toString());
  logVar(`Pda`, saleAddress.toString());

  return await program.methods
    .participateInSale(id, ONE_SOL, 50)
    .accounts({
      sender: provider.publicKey,
    })
    .rpc();
}

main().then(successHandler).catch(errorHandler);
