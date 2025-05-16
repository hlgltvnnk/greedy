import React, { memo } from 'react';
import { IClaimSuccessModal } from '../../interfaces/modals';
import { useTokensStore } from '../../store/useTokensStore';
import { getAmountFormatted } from '../../utils/core';
import { useSaleStore } from '../../store/useSaleStore';
import { SALE_TOKEN_DECIMALS } from '../../constants/sale';
import { calculateReward } from '../../utils/airdrops';
import Big from 'big.js';

const ClaimSuccessModal: React.FC<IClaimSuccessModal> = memo(({ closeModal, saleId }) => {
  const sales = useSaleStore((state) => state.sales);
  const sale = sales.get(saleId ?? '');
  const participants = useSaleStore((state) => state.participants);
  const participant = participants.get(saleId ?? '');
  const tokenMeta = useTokensStore((state) => sale?.mint && state.getMetadata(sale?.mint));

  const userReward = calculateReward(
    new Big(participant?.greedLevel),
    new Big(participant?.depositedAmount),
    new Big(sale?.totalGreed),
    new Big(sale?.depositedAmount),
    new Big(sale?.targetDeposit),
  );

  const amount = getAmountFormatted(userReward || '0', SALE_TOKEN_DECIMALS);

  return (
    <div className="modal flex items-center justify-center flex-col p-6 max-w-[360px] md:max-w-[440px] lg:max-w-[500px] lg:p-8">
      <img className="mb-9" src="/images/modals/claim-success.svg" />
      <h3 className="mb-4 text-5xl font-semibold text-center">Greedily snatched!</h3>
      <p className="mb-2 text-[#B7CFD7] text-base font-normal font-secondary">
        You've successfully claimed
      </p>
      <div className="mb-4 flex items-center justify-center w-full p-4 border solid rounded-2xl border-[#030201] bg-background text-lg font-semibold">
        <p>
          {amount} {tokenMeta?.symbol || ''}
        </p>
      </div>
      <p className="mb-9 text-[#B7CFD7] text-center text-base font-normal font-secondary">
        Greed doesn't blink 👀
      </p>
      <button onClick={closeModal} className="primary-button w-full">
        Okay, cool
      </button>
    </div>
  );
});

export default ClaimSuccessModal;
