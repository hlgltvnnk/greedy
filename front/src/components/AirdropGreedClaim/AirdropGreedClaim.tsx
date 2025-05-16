import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useWallet } from '@solana/wallet-adapter-react';
import Big from 'big.js';
import { useTokensStore } from '../../store/useTokensStore';
import { getAmountFormatted, uuidToBn } from '../../utils/core';
import { useAppStore } from '../../store/appStore';
import { showToast } from '../../utils/toast';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { useSaleStore } from '../../store/useSaleStore';
import { SALE_TOKEN_DECIMALS } from '../../constants/sale';
import { formatTimeUntilFull } from '../../utils/date';
import { GreedySalesService } from '../../services/contracts';
import { useNowMs } from '../../hooks/useNowMs';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';
import {
  calculateReward,
  calculateRewardFirst,
  calculateUserGreed,
  getAirdropStatus,
} from '../../utils/airdrops';

interface IAirdropGreedClaimProps {
  sale: ISale;
}

const AirdropGreedClaim: React.FC<IAirdropGreedClaimProps> = ({ sale }) => {
  const { publicKey, connected } = useWallet();
  const showModal = useModalStore((state) => state.showModal);
  const tokenId = sale.mint.toString() || '';
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));
  const participant = useSaleStore((state) => state.participants.get(sale.id));

  const now = useNowMs(5_000);
  const status = getAirdropStatus(sale, now);

  const endDate = sale?.endDate || null;
  const lockDurationMs = participant?.claimHour ? participant?.claimHour * 3600 * 1000 : 0;

  const unlockDate =
    lockDurationMs && endDate ? new Date(endDate.getTime() + lockDurationMs) : null;

  const isClaimed = participant?.isClaimed;
  const isUnlocked = unlockDate ? now > unlockDate.getTime() : false;
  const isClaimable = isUnlocked && !isClaimed;
  const isAirdropCompleted = status === EAirdropStatus.COMPLETED;

  const maxGreed = calculateUserGreed(
    new Big(participant?.depositedAmount),
    sale.unlockRange[1],
    sale.unlockRange[0],
    sale.unlockRange[1],
  );

  const isFirst = new Big(sale.stats.participationCount).eq(1);
  const userReward = isFirst
    ? calculateRewardFirst(
        new Big(participant?.greedLevel),
        new Big(participant?.depositedAmount),
        new Big(sale.depositedAmount),
        new Big(sale.targetDeposit),
        new Big(maxGreed),
      )
    : calculateReward(
        new Big(participant?.greedLevel),
        new Big(participant?.depositedAmount),
        new Big(sale.totalGreed),
        new Big(sale.depositedAmount),
        new Big(sale.targetDeposit),
      );

  const reward = getAmountFormatted(userReward || '0', SALE_TOKEN_DECIMALS);

  const onClaim = async () => {
    if (!connected || !publicKey) {
      showModal(EModals.CONNECT_WALLET);
      return;
    }
    if (!tokenId) {
      showToast('error', 'Invalid token ID, please reload the page');
      return;
    }

    try {
      setIsLoading(true);
      const signature = await GreedySalesService.claim(uuidToBn(sale.id), publicKey);
      const confirmation = await GreedySalesService.confirmTx(signature);

      if (confirmation.value.err) {
        console.error('Transaction failed', confirmation.value.err);
        showToast('error', 'Claim transaction failed');
      } else {
        showToast('success', 'Claim successful!');
        showModal(EModals.CLAIM_SUCCESS, { saleId: sale.id });
      }
    } catch (error) {
      console.error('Error claiming airdrop:', error);
      showToast('error', 'Error claiming airdrop');
    } finally {
      setIsLoading(false);
    }
  };

  const title = useMemo(() => {
    if (isClaimed) return 'Greed Claimed';
    if (isUnlocked) return 'Greed Ready to claim';
    if (status === EAirdropStatus.LIVE) return 'Waiting for distribution';
    return 'Greed In Progress';
  }, [isClaimed, isUnlocked, status]);

  const getClaimTitle = () => {
    if (isClaimed && status === EAirdropStatus.COMPLETED) return 'Already claimed';
    if (isUnlocked) return 'Ready to claim';
    return unlockDate ? formatTimeUntilFull(unlockDate, true) : '-';
  };

  const buttonText = useMemo(() => {
    if (isClaimed) return 'Claimed';
    if (isUnlocked) return 'Claim';
    if (status === EAirdropStatus.LIVE) return 'Waiting for distribution';
    return 'Distribution';
  }, [isClaimed, isUnlocked, status]);

  const unlockedAmount = useMemo(() => {
    if (!endDate || !unlockDate) return '0';
    if (now < endDate.getTime()) return '0';
    const total = new Big(userReward);
    const elapsed = now - endDate.getTime();
    if (elapsed >= lockDurationMs) {
      return total.toString();
    }
    const progress = new Big(elapsed).div(lockDurationMs);
    const unlocked = total.times(progress);
    return unlocked.toFixed();
  }, [now, endDate, unlockDate, userReward, lockDurationMs]);

  const unlockedFormatted = getAmountFormatted(unlockedAmount, SALE_TOKEN_DECIMALS);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 w-full mb-2">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-[18px] lg:text-2xl font-bold">{title}</h2>
          <p className="text-sm font-secondary font-medium text-secondary-text">
            The longer you wait, the more you claim
          </p>
        </div>

        <div className="container-bg-dark justify-start flex flex-col gap-3 w-full">
          <div className="flex flex-row gap-2 items-center text-md w-full ">
            <h3 className="flex flex-row gap-1 items-center text-sm font-secondary font-semibold text-secondary-text">
              <img className="w-4 h-4 m-w-4 m-h-4" src="/images/airdrop/time.png" alt="greed" />
              Claim available in:
            </h3>
            <p
              className="text-sm font-bold"
              dangerouslySetInnerHTML={{ __html: getClaimTitle() }}
            />
          </div>
          <div className="flex flex-row gap-2 items-center text-md w-full">
            <h3 className="flex flex-row gap-1 items-center text-sm font-secondary font-semibold text-secondary-text">
              <img className="w-4 h-4 m-w-4 m-h-4" src="/images/airdrop/reward.png" alt="greed" />
              Estimated Reward:
            </h3>
            <p className="text-sm font-bold">
              {reward} {tokenMetadata?.symbol}
            </p>
          </div>
        </div>
      </div>

      <div className={classNames('flex flex-col gap-4 w-full', !isAirdropCompleted && 'hidden')}>
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-[18px] lg:text-2xl font-bold">Tokens Accrued:</h2>
          <p className="text-sm font-secondary font-medium text-secondary-text">
            Your current reward based on selected lock period
          </p>
        </div>

        <div className="container-bg-dark px-4 py-8 w-full">
          <h2 className="text-[30px] lg:text-[40px] font-bold text-center">
            {unlockedFormatted}{' '}
            {tokenMetadata && (
              <span className="text-secondary-text uppercase">{tokenMetadata?.symbol}</span>
            )}
          </h2>
        </div>
      </div>

      <button className="primary-button text-lg" onClick={onClaim} disabled={!isClaimable}>
        {buttonText}
      </button>

      {!isClaimed && (
        <p className="text-sm text-secondary-text font-secondary">
          *Reward is estimated and may vary depending on the actual amount of participants.
        </p>
      )}

      <div className="relative flex items-center justify-center w-full">
        <img
          className="lg:hidden w-[200px] lg:w-[332px] lg:h-[482px] lg:m-w-[332px] lg:m-h-[482px] ml-[44px] z-1"
          src="/images/greed-progress.png"
          alt=""
        />
      </div>
    </div>
  );
};

export default AirdropGreedClaim;
