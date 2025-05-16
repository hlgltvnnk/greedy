import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { ISaleStatsAccount } from '../utils/parsers';

export interface IAirdrop {
  name: string;
  min_score: number;
  start_date: number; // Unix timestamp (seconds)
  end_date: number | null; // Unix timestamp (seconds) or null

  total_amount: string;
  claimed_amount: string;
  available_amount: string;

  participation_fee: string;
  score_token: string; // Fee token

  multiplier: number;
  unlock_packs: [number, string][]; // [hours, amount]
}

export type IAirdropEntry = [string, IAirdrop];

export interface IAirdropClaim {
  amount: string;
  claimed: boolean;
  lock_duration: number; // Unix timestamp (seconds)
}

export type IAirdropClaimEntry = [string, IAirdropClaim];

export enum EAirdropStatus {
  UPCOMING = 'Upcoming',
  LIVE = 'Live',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export enum EAirdropEligibility {
  INCOMPLETE = 'Incomplete',
  APPROVED = 'Approved',
}

export interface ISale {
  publicKey?: PublicKey;
  authority: PublicKey;
  completed: boolean;
  name: string;
  description: string;
  depositedAmount: BN;
  endDate: Date;
  id: BN;
  isLocked: boolean;
  mint: PublicKey;
  startDate: Date;
  unlockRange: number[];
  version: number;
  stats: ISaleStatsAccount;
  targetDeposit: BN;
  totalGreed: BN;
}

export interface ISaleData {
  authority: PublicKey;
  bump: number;
  completed: boolean;
  description: string;
  distributionAmount: number;
  endDate: Date;
  id: string;
  isActive: boolean;
  mint: PublicKey;
  startDate: Date;
  unlockRange: number;
  version: number;
}

export interface IParticipant {
  version: number;
  saleId: string;
  payer: PublicKey;
  claimHour: number;
  depositedAmount: BN;
  greedLevel: BN;
  isClaimed: boolean;
}
