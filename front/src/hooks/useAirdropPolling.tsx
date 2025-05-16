import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSaleStore } from '../store/useSaleStore';
import { EAirdropStatus } from '../interfaces/airdrops';
import { getAirdropStatus } from '../utils/airdrops';

export const useAirdropPolling = (saleId: string, intervalMs = 5000) => {
  const { publicKey } = useWallet();
  const fetchSale = useSaleStore((s) => s.fetchSale);
  const fetchParticipant = useSaleStore((s) => s.fetchParticipant);

  useEffect(() => {
    if (!saleId) return;

    const fetchSaleAndParticipant = () => {
      const sale = useSaleStore.getState().getSale(saleId);
      const saleStatus = getAirdropStatus(sale, new Date().getTime());
      if (saleStatus === EAirdropStatus.LIVE || saleStatus === EAirdropStatus.UPCOMING) {
        fetchSale(saleId);
      }
      if (publicKey) {
        if (useSaleStore.getState().participants.get(saleId)?.isClaimed) return;
        fetchParticipant(saleId, publicKey);
      }
    };

    const interval = setInterval(() => fetchSaleAndParticipant(), intervalMs);

    fetchSaleAndParticipant();
    return () => clearInterval(interval);
  }, [saleId, intervalMs, publicKey?.toBase58()]);
};
