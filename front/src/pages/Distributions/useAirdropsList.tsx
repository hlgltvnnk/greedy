import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { getAirdropStatus } from '../../utils/airdrops';
import { useSaleStore } from '../../store/useSaleStore';
import { useNowMs } from '../../hooks/useNowMs';
import { useAppStore } from '../../store/appStore';

export const useAirdropsList = () => {
  const now = useNowMs();
  const { publicKey } = useWallet();
  const sales = useSaleStore((s) => s.sales);
  const participants = useSaleStore((s) => s.participants);
  const showCreatedSales = useAppStore((s) => s.showCreatedSales);
  const showParticipatedSales = useAppStore((s) => s.showParticipatedSales);

  const filteredSales = useMemo(() => {
    const result: ISale[] = [];

    for (const sale of sales.values()) {
      const isCreated = publicKey && sale.authority.equals(publicKey);
      const isParticipated = participants.has(sale.id);

      if (showCreatedSales && !showParticipatedSales) {
        if (isCreated) result.push(sale);
      } else if (!showCreatedSales && showParticipatedSales) {
        if (isParticipated) result.push(sale);
      } else if (showCreatedSales && showParticipatedSales) {
        if (isCreated || isParticipated) result.push(sale);
      } else {
        result.push(sale);
      }
    }

    return result;
  }, [sales, participants, publicKey, showCreatedSales, showParticipatedSales]);

  const categorized = useMemo(() => {
    const result = {
      [EAirdropStatus.LIVE]: [] as ISale[],
      [EAirdropStatus.UPCOMING]: [] as ISale[],
      [EAirdropStatus.COMPLETED]: [] as ISale[],
      [EAirdropStatus.FAILED]: [] as ISale[],
    };

    for (const sale of filteredSales) {
      const status = getAirdropStatus(sale, now);
      if (status) result[status].push(sale);
    }

    return result;
  }, [filteredSales, now]);

  return {
    liveCards: categorized[EAirdropStatus.LIVE],
    upcomingCards: categorized[EAirdropStatus.UPCOMING],
    completedCards: [
      ...categorized[EAirdropStatus.COMPLETED],
      ...categorized[EAirdropStatus.FAILED],
    ],
  };
};
