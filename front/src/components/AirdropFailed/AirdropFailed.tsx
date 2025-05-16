import React from 'react';
import { ISale } from '../../interfaces/airdrops';
import { useSaleStore } from '../../store/useSaleStore';
import { useAppStore } from '../../store/appStore';
import { GreedySalesService } from '../../services/contracts';
import { useWallet } from '@solana/wallet-adapter-react';
import { showToast } from '../../utils/toast';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';
import { uuidToBn } from '../../utils/core';

interface IAirdropFailedProps {
  sale: ISale;
}

const AirdropFailed: React.FC<IAirdropFailedProps> = ({ sale }) => {
  const { publicKey } = useWallet();
  const showModal = useModalStore((state) => state.showModal);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const participants = useSaleStore((state) => state.participants);
  const participant = participants.get(sale.id);
  const fetchParticipant = useSaleStore((state) => state.fetchParticipant);

  const onRequestChargeback = async () => {
    if (!publicKey) {
      showModal(EModals.CONNECT_WALLET);
      return;
    }
    try {
      setIsLoading(true);
      const saleId = uuidToBn(sale.id);
      const signature = await GreedySalesService.recharge(saleId, publicKey);
      const confirmation = await GreedySalesService.confirmTx(signature);
      if (confirmation.value.err) {
        throw new Error(JSON.stringify(confirmation.value.err));
      } else {
        showToast('success', 'Chargeback requested successfully');
        await fetchParticipant(sale.id, publicKey);
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Chargeback request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="paper flex flex-row gap-4 h-fit bg-[#1D2F34]">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl/[100%] font-semibold">Sale Failed</h2>
        <p className="font-secondary text-base/[140%] text-[#B7CFD7]">
          The sale didn't reach its goal within the time limit. Participants can now request a
          chargeback and reclaim their SOL.
        </p>
        {participant && !participant.isClaimed && (
          <button onClick={onRequestChargeback} className="secondary-light-button mt-4 text-[18px]">
            Request Chargeback
          </button>
        )}
      </div>
      <img
        className="w-[132px] h-[198px] min-w-[132px] min-h-[198px]"
        src="/images/sale-failed.png"
        alt="Sale Failed"
      />
    </div>
  );
};

export default AirdropFailed;
