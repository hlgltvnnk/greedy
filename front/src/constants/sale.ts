import Big from 'big.js';

export const SALE_MULTIPLIER = 0.2;

export const SALE_TOKEN_DECIMALS = 9;

export const SALE_TOKENS_POOL = new Big(100_000_000 * 10 ** SALE_TOKEN_DECIMALS);

export const SALE_TOKENS_DISTRIBUTION = SALE_TOKENS_POOL.mul(80).div(100); // 80%

export const SALE_SOL_MIN = 0.0075;
export const SALE_SOL_MAX = 100;

export const MIN_HOURS = 1;
export const MAX_HOURS = 100;

export const MAX_DESCRIPTION_LENGTH = 256;
export const MAX_SALE_NAME_LENGTH = 32;
export const MAX_TOKEN_NAME_LENGTH = 32;
export const MAX_TOKEN_SYMBOL_LENGTH = 10;

export const MIN_TARGET_IN_SOL = 5;

export const CLAIM_MULTIPLIERS: { range: [number, number]; multiplier: number }[] = [
  { range: [1, 10], multiplier: 500_000 },
  { range: [11, 20], multiplier: 750_000 },
  { range: [21, 30], multiplier: 950_000 },
  { range: [31, 40], multiplier: 1_100_000 },
  { range: [41, 50], multiplier: 1_200_000 },
  { range: [51, 60], multiplier: 1_350_000 },
  { range: [61, 70], multiplier: 1_500_000 },
  { range: [71, 100], multiplier: 1_750_000 },
];
