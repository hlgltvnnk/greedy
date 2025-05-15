import {
  AnchorProvider,
  setProvider,
  Program,
  workspace,
  BN,
} from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import { PublicKey } from "@solana/web3.js";

import { errorHandler, logVar, successHandler } from "./util";
import { GreedySolana } from "../target/types/greedy_solana";

import {
  bnToUuid,
  bufferFromString,
  ONE_SOL,
  uuidToBn,
} from "../tests/util/setup";
import { v4 as uuidv4 } from "uuid";
import { findSaleAddress } from "../tests/util/entity";

dotenv.config();

const provider = AnchorProvider.env();
setProvider(provider);

const now = new BN(Math.round(new Date().getTime()) / 1000);

const TOKEN_NAME = "Test Token";
const TOKEN_SYMBOL = "TT";
const TOKEN_URI = "https://example.com/token";

const UNLOCK_WITH_ADMIN = false;
const SALE_NAME = "Amm test";
const SALE_DESCRIPTION = "Test for amm creation, pls do not participate";

const START_DATE = now;
const END_DATE = now.addn(1);

const UNLOCK_RANGE = [1, 50];

async function main() {
  const programId = process.env.PROGRAM_ID;

  if (!programId) {
    throw new Error("PROGRAM_ID is not set");
  }

  const program = workspace.GreedySolana as Program<GreedySolana>;
  const id = uuidToBn(uuidv4());

  const saleAddress = await findSaleAddress(id);
  const authority = provider.publicKey;

  logVar(`Creating sale with id`, bnToUuid(id));
  logVar(`Pda`, saleAddress.toString());
  logVar(`Sale owner`, authority.toString());

  const metadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: TOKEN_URI,
  };

  const args = {
    metadata,
    unlockWithAdmin: UNLOCK_WITH_ADMIN,
    name: Array.from(bufferFromString(SALE_NAME, 32)),
    description: Array.from(bufferFromString(SALE_DESCRIPTION, 256)),
    startDate: START_DATE,
    endDate: END_DATE,
    unlockRange: UNLOCK_RANGE,
    targetDeposit: ONE_SOL,
  };

  return await program.methods
    .createSale(id, args)
    .accounts({
      authority,
    })
    .rpc();
}

main().then(successHandler).catch(errorHandler);
