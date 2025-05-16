import { useNowMs } from './useNowMs';
import { getAirdropStatus } from '../utils/airdrops';
import { ISale } from '../interfaces/airdrops';
import { EAirdropStatus } from '../interfaces/airdrops';

/**
 * Returns the current status of an airdrop (LIVE, UPCOMING, COMPLETED).
 * Automatically updates over time via useNow().
 */
export const useAirdropStatus = (sale?: ISale | null): EAirdropStatus | null => {
  const now = useNowMs(5_000);
  return getAirdropStatus(sale, now);
};
