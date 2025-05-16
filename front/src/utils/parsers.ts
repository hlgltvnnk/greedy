import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { IParticipant, ISale } from '../interfaces/airdrops';

export interface ISaleStatsAccount {
  version: number;
  id: BN;
  stats: Array<BN>; // u64[10]
  participationCount: BN;
}

export interface ISaleAccount {
  authority: PublicKey;
  completed: boolean;
  depositedAmount: BN;
  endDate: BN;
  id: BN;
  isLocked: boolean;
  mint: PublicKey;
  startDate: BN;
  unlockRange: number[];
  version: number;
  name: number[]; // u8[32]
  description: number[]; // u8[256]
  targetDeposit: BN;
  totalGreed: BN;
}

export interface IRawSaleAccount {
  account: ISaleAccount;
  stats: ISaleStatsAccount;
  publicKey: PublicKey;
}

export interface IRawParticipantAccount {
  version: number;
  saleId: BN;
  payer: PublicKey;
  claimHour: number;
  depositedAmount: BN;
  greedLevel: BN;
  isClaimed: boolean;
}

export const parseSaleAccount = (
  account: ISaleAccount,
  stats: ISaleStatsAccount,
  publicKey?: PublicKey,
): ISale | null => {
  try {
    return {
      publicKey: publicKey,
      authority: account.authority,
      completed: account.completed,
      name: decodeDescription(account.name),
      description: decodeDescription(account.description),
      depositedAmount: account.depositedAmount,
      targetDeposit: account.targetDeposit,
      totalGreed: account.totalGreed,
      endDate: new Date(account.endDate.toNumber() * 1000),
      id: bnToUuid(account.id),
      isLocked: account.isLocked,
      mint: account.mint,
      startDate: new Date(account.startDate.toNumber() * 1000),
      unlockRange: account.unlockRange,
      version: account.version,
      stats: stats,
    };
  } catch (error) {
    console.error('Error parsing sale account', error);
    return null;
  }
};

export const parseParticipant = (account: IRawParticipantAccount): IParticipant => {
  return {
    version: account.version,
    saleId: bnToUuid(account.saleId),
    payer: account.payer,
    claimHour: account.claimHour,
    depositedAmount: account.depositedAmount,
    greedLevel: account.greedLevel,
    isClaimed: account.isClaimed,
  };
};

const decodeDescription = (desc: number[]): string => {
  return Buffer.from(desc).toString('utf-8').replace(/\0/g, '').trim();
};

const bnToUuid = (bn: BN): string => {
  const hex = bn.toString(16).padStart(32, '0');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};
