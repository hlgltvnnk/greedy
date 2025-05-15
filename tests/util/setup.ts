import { BN, web3, utils } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { parse as uuidParse, v4 as uuidv4 } from "uuid";

export const TEST_PROGRAM_ID = new PublicKey(
  "GREEd3qyRDkKMeWZ6Kw7pf1FvcgBdNgpJQ7oxQ7Sq4H3"
);

export const AMM_PROGRAM = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";

export const ONE_SOL = new BN(1_000_000_000);

export const DEFAULT_FEE = new BN(2);
export const DEFAULT_MULTIPLIER = new BN(20);
export const SCALE = new BN(100);

export const MIN_TARGET_DEPOSIT = ONE_SOL.muln(5);
export const MAX_DEPOSIT = ONE_SOL.muln(100);
export const MIN_DEPOSIT = ONE_SOL.divn(10000).muln(75);

export const DEFAULT_COMPLETION_PERCENTAGE = 80;
export const DEFAULT_SUPPLY = new BN(100_000_000).mul(ONE_SOL);
export const DEFAULT_DECIMALS = 9;

export async function airdrop(
  connection: web3.Connection,
  publicKey: PublicKey
) {
  await connection.requestAirdrop(publicKey, 1000 * web3.LAMPORTS_PER_SOL);

  // Wait for airdrop
  while ((await connection.getBalance(publicKey)) < web3.LAMPORTS_PER_SOL) {
    await sleep(100);
  }
}

export async function waitUntil(until: number): Promise<void> {
  const now = Math.round(new Date().getTime()) / 1000;

  if (now < until) {
    await sleep((until - now) * 1000);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ignoreIfExist(fn: () => Promise<any>) {
  try {
    await fn();
  } catch (error) {
    const errorMessage = String(error);

    if (!errorMessage.includes("custom program error: 0x0")) {
      throw error;
    }
  }
}

export function padBuffer(buffer: Buffer | Uint8Array, targetSize: number) {
  if (!(buffer instanceof Buffer)) {
    buffer = Buffer.from(buffer);
  }

  if (buffer.byteLength > targetSize) {
    throw new RangeError(`Buffer is larger than target size: ${targetSize}`);
  }

  return Buffer.concat(
    [buffer, Buffer.alloc(targetSize - buffer.byteLength)],
    targetSize
  );
}

export function bufferFromString(str: string, bufferSize?: number) {
  const utf = utils.bytes.utf8.encode(str);

  if (!bufferSize || utf.byteLength === bufferSize) {
    return Buffer.from(utf);
  }

  if (bufferSize && utf.byteLength > bufferSize) {
    throw RangeError("Buffer size too small to fit the string");
  }

  return padBuffer(utf, bufferSize);
}

export function uuidToBn(id: string): BN {
  return new BN(Buffer.from(uuidParse(id)), "be");
}

export function bnToUuid(id: BN | number[]): string {
  const buf = id instanceof Array ? id : id.toArray("be");

  if (buf.length != 16) {
    throw RangeError("Invalid UUID");
  }

  return uuidv4({ random: buf });
}
