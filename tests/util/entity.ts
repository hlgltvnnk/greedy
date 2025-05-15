import { PublicKey } from "@solana/web3.js";
import { bufferFromString, TEST_PROGRAM_ID } from "./setup";
import BN from "bn.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const ACCOUNT_SIZE: Readonly<Record<any, number>> = {
  state: 89,
  sale: 424,
  saleStats: 833,
  participant: 76,
};

export function findProgramDataAddress() {
  return PublicKey.findProgramAddressSync(
    [TEST_PROGRAM_ID.toBytes()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );
}

export function findContractStateAddress(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [bufferFromString("state")],
    TEST_PROGRAM_ID
  );
}

export function findSaleAddress(saleId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [bufferFromString("sale"), saleId.toBuffer("le", 16)],
    TEST_PROGRAM_ID
  );
}

export function findSaleStatsAddress(saleId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [bufferFromString("sale_stats"), saleId.toBuffer("le", 16)],
    TEST_PROGRAM_ID
  );
}

export function findSaleMintAddress(saleId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [bufferFromString("sale_mint"), saleId.toBuffer("le", 16)],
    TEST_PROGRAM_ID
  );
}

export function findMetadataAddress(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

export function findParticipantAddress(
  saleId: BN,
  sender: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      bufferFromString("participant"),
      saleId.toBuffer("le", 16),
      sender.toBytes(),
    ],
    TEST_PROGRAM_ID
  );
}
