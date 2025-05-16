import Big from 'big.js';
import { EAirdropStatus, ISale } from '../interfaces/airdrops';
import { CLAIM_MULTIPLIERS, SALE_MULTIPLIER, SALE_TOKENS_DISTRIBUTION } from '../constants/sale';

const defaultToken = '/images/tokens/defaultToken.svg';

export const getGreedImageSrc = (hours: number): string => {
  if (hours >= 0 && hours < 21) return '/images/greed/1.svg';
  if (hours >= 21 && hours < 41) return '/images/greed/2.svg';
  if (hours >= 41 && hours < 61) return '/images/greed/3.svg';
  if (hours >= 61 && hours < 81) return '/images/greed/4.svg';
  if (hours >= 81 && hours <= 100) return '/images/greed/5.svg';
  return '/images/greed/1.svg';
};

export const getGreedLevel = (hours: number): { label: string; color: string } => {
  if (hours >= 1 && hours < 21) return { label: 'Rookie Greed', color: '#C6FF00' };
  if (hours >= 21 && hours < 41) return { label: 'Tactical Greed', color: '#FFD447' };
  if (hours >= 41 && hours < 61) return { label: 'True Greed', color: '#FFA500' };
  if (hours >= 61 && hours < 81) return { label: 'Ultra Greed', color: '#FF6D00' };
  if (hours >= 81 && hours <= 100) return { label: 'God of Greed', color: '#FF3939' };
  return { label: 'No Greed Selected', color: '#96B9C5' };
};

/**
 * Determine the status of an airdrop based on current time.
 */
export const getAirdropStatus = (sale?: ISale | null, now?: number): EAirdropStatus | null => {
  if (!sale || typeof now !== 'number') return null;

  if (sale.startDate.getTime() > now) {
    return EAirdropStatus.UPCOMING;
  }

  if (sale.startDate.getTime() <= now && (sale.endDate === null || sale.endDate.getTime() >= now)) {
    return EAirdropStatus.LIVE;
  }

  const total = new Big(sale.targetDeposit.toString());
  const deposited = new Big(sale.depositedAmount.toString());
  if (deposited.gte(total) && now >= sale.endDate.getTime()) {
    return EAirdropStatus.COMPLETED;
  }

  return EAirdropStatus.FAILED;
};

export const getValidIcon = (string?: string) => {
  let url;
  if (!string) return defaultToken;
  try {
    return new URL(string) as unknown as string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    url = defaultToken;
  }

  return url;
};

interface LockedStats {
  lockedAmount: Big.Big;
  lockedPercent: string;
}

/**
 * Calculates locked amount and locked percent based on airdrop data.
 *
 * lockedAmount = total - claimed - available
 * lockedPercent = (lockedAmount / total) * 100
 */
export const getLockedStats = (total_amount: string, available_amount: string): LockedStats => {
  const total = new Big(total_amount || 0);
  const available = new Big(available_amount || 0);

  const rawLocked = total.minus(available);
  const lockedAmount = Big(total.gt(available) ? rawLocked : 0);

  const lockedPercent = total.eq(0) ? new Big(0) : lockedAmount.div(total).times(100);

  const lockedPercentFormatted = new Intl.NumberFormat('en-US', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(lockedPercent.toNumber());

  return {
    lockedAmount: lockedAmount,
    lockedPercent: lockedPercentFormatted,
  };
};

export const formatHeatMapYAxisValue = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

export const findMaxAvailableHours = (
  amount: number,
  availableTokens: number,
  hoursRangeMax: number,
): number => {
  let maxHour = 0;

  for (const entry of CLAIM_MULTIPLIERS) {
    const { range, multiplier } = entry;
    const reward = amount * multiplier;

    if (reward <= availableTokens) {
      const [, to] = range;
      if (to > maxHour) {
        maxHour = to;
      }
    }
  }

  if (maxHour > hoursRangeMax) {
    return hoursRangeMax;
  }

  return maxHour;
};

export const calculateUserGreed = (
  amount: Big,
  claimHour: number,
  lowerBound: number,
  upperBound: number,
): string => {
  const range = new Big(1 + upperBound - lowerBound);
  const hours = new Big(claimHour).div(range);
  const total = new Big(SALE_MULTIPLIER).plus(hours);
  const greed = amount.times(total);

  return greed.round(0, 0).toString();
};

export const calculateReward = (
  userGreed: Big,
  userAmount: Big, // lamports
  totalGreed: Big,
  totalAmount: Big, // lamports
  target: Big,
): Big => {
  if (userAmount.eq(0)) return new Big(0);

  const zero = new Big(0);

  const fullDistribution = SALE_TOKENS_DISTRIBUTION;

  const distributionTokens = totalAmount.gte(target)
    ? fullDistribution
    : fullDistribution.times(totalAmount.div(target));

  if (distributionTokens.lte(zero)) return zero;

  const rewardPerGreed = distributionTokens.div(totalGreed);
  const reward = rewardPerGreed.times(userGreed);

  return reward.gt(SALE_TOKENS_DISTRIBUTION) ? SALE_TOKENS_DISTRIBUTION : reward;
};

export const calculateRewardFirst = (
  userGreed: Big,
  userAmount: Big, // lamports
  totalAmount: Big, // lamports
  target: Big,
  maxUserGreed: Big,
): Big => {
  if (userAmount.eq(0)) return new Big(0);

  const zero = new Big(0);
  const distributionShare = totalAmount.div(target);
  const distributionTokens = SALE_TOKENS_DISTRIBUTION.times(distributionShare);

  if (distributionTokens.lte(zero)) return zero;

  const baseReward = userAmount.div(totalAmount).times(distributionTokens);

  const rawGreedFactor = userGreed.div(maxUserGreed);
  const greedFactor = rawGreedFactor.gt(1)
    ? new Big(1)
    : rawGreedFactor.lt(0)
    ? new Big(0)
    : rawGreedFactor;

  const reward = baseReward.times(greedFactor);

  return reward.gt(SALE_TOKENS_DISTRIBUTION) ? SALE_TOKENS_DISTRIBUTION : reward;
};
