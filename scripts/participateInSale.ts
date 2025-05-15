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

import { uuidToBn } from "../tests/util/setup";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

async function main() {
  const [SALE_ID, AMOUNT, CLAIM_HOUR] = process.argv.slice(2);
  const programId = process.env.PROGRAM_ID;

  if (!SALE_ID || !AMOUNT || !CLAIM_HOUR) {
    throw new Error(
      `Usage: npm run participate-in-sale <SALE_ID> <AMOUNT> <CLAIM_HOUR>`
    );
  }

  if (!programId) {
    throw new Error("PROGRAM_ID is not set");
  }

  const program = workspace.GreedySolana as Program<GreedySolana>;

  logVar(`Participating in sale`, SALE_ID);
  logVar(`Amount`, AMOUNT);
  logVar(`Claim hour`, CLAIM_HOUR);

  const saleId = uuidToBn(SALE_ID);
  const claimHour = parseInt(CLAIM_HOUR, 10);
  const amount = new BN(AMOUNT);

  return await program.methods
    .participateInSale(saleId, amount, claimHour)
    .accounts({
      sender: provider.publicKey,
    })
    .rpc();
}

main().then(successHandler).catch(errorHandler);
