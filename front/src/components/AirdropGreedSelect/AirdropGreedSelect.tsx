import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import Big from 'big.js';
import { BN } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAmountFormatted, uuidToBn } from '../../utils/core';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { useTokensStore } from '../../store/useTokensStore';
import { showToast } from '../../utils/toast';
import { useAppStore } from '../../store/appStore';
import useModalStore from '../../store/modals.store';
import { useAirdropStatus } from '../../hooks/useAirdropStatus';
import AirdropGreedLevel from '../AirdropGreedLevel/AirdropGreedLevel';
import { EModals } from '../../interfaces/modals';
import {
  calculateReward,
  calculateRewardFirst,
  calculateUserGreed,
  getGreedImageSrc,
} from '../../utils/airdrops';
import {
  MIN_HOURS,
  MAX_HOURS,
  SALE_SOL_MIN,
  SALE_SOL_MAX,
  SALE_TOKEN_DECIMALS,
} from '../../constants/sale';
import { GreedySalesService } from '../../services/contracts';
import { SOL_DECIMALS } from '../../constants/core';
import { useSaleStore } from '../../store/useSaleStore';

interface IAirdropGreedSelectProps {
  sale: ISale;
}

const AirdropGreedSelect: React.FC<IAirdropGreedSelectProps> = ({ sale }) => {
  const { connected, publicKey } = useWallet();
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const showModal = useModalStore((state) => state.showModal);
  const fetchParticipant = useSaleStore((state) => state.fetchParticipant);

  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale?.mint));

  const [hours, setHours] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [greedOutcome, setGreedOutcome] = useState<string>('0');
  const [solBalance, setSolBalance] = useState<{
    amount: number;
    formattedAmount: string;
  }>({ amount: 0, formattedAmount: '0' });
  const [amountError, setAmountError] = useState<string | null>(null);

  const status = useAirdropStatus(sale);

  const isLive = status === EAirdropStatus.LIVE;
  const isUpcoming = status === EAirdropStatus.UPCOMING;
  const isCompleted = status === EAirdropStatus.COMPLETED;

  const hoursRangeMin = sale?.unlockRange[0] || MIN_HOURS;
  const hoursRangeMax = sale?.unlockRange[1] || MAX_HOURS;

  const greedImage = getGreedImageSrc(Number(hours));

  const handleGreed = async () => {
    if (!connected || !publicKey) {
      showModal(EModals.CONNECT_WALLET);
      return;
    }
    if (new Big(greedOutcome).eq(new Big(0))) {
      showToast('warning', 'Greed outcome cannot be 0...');
      return;
    }
    if (sale.isLocked && !sale.authority.equals(publicKey)) {
      showToast(
        'warning',
        'This sale is locked, please wait for it to be unlocked by admin participating...',
      );
      return;
    }
    try {
      setIsLoading(true);
      const saleId = uuidToBn(sale.id);

      const amountToParticipate =
        amount === solBalance.formattedAmount
          ? new BN(solBalance.amount)
          : new BN(Number(amount) * 10 ** SOL_DECIMALS);

      const signature = await GreedySalesService.participate(
        saleId,
        Number(hours),
        amountToParticipate,
        publicKey,
      );
      const confirmation = await GreedySalesService.confirmTx(signature);

      if (confirmation.value.err) {
        console.error('Transaction failed', confirmation.value.err);
        showToast('error', 'Participate transaction failed');
      } else {
        showToast('success', 'Participate successful!');
        showModal(EModals.PARTICIPATE_SUCCESS, { saleId: sale.id });
        await fetchParticipant(sale.id, publicKey);
      }
    } catch (error) {
      console.error('Error participating in airdrop:', error);
      showToast('error', 'Error participating in airdrop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHoursChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (/^\d*$/.test(value)) {
        if (Number(value) > hoursRangeMax) {
          setHours(String(hoursRangeMax));
        } else {
          setHours(value);
        }
      }
    },
    [hoursRangeMax],
  );

  const handleAmountChange = useCallback(
    (value: string) => {
      if (/^\d*\.?\d*$/.test(value)) {
        setAmount(value);

        const num = parseFloat(value);
        const maxAmount = new Big(solBalance.amount).div(10 ** SOL_DECIMALS).toString();
        if (isNaN(num)) {
          setAmountError(null);
        } else if (num < SALE_SOL_MIN) {
          setAmountError(`Minimum amount is ${SALE_SOL_MIN} SOL`);
        } else if (num > SALE_SOL_MAX) {
          setAmountError(`Maximum amount is ${SALE_SOL_MAX} SOL`);
        } else if (num > Number(maxAmount)) {
          setAmountError('Insufficient balance');
        } else {
          setAmountError(null);
        }
      }
    },
    [solBalance.amount],
  );

  const handleMaxAmount = useCallback(() => {
    handleAmountChange(solBalance.formattedAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solBalance]);

  const isGreedButtonDisabled = useMemo(() => {
    if (!connected) return false;
    if (isCompleted || isUpcoming) return true;
    if (isLive) return Number(hours) === 0 || Number(amount) === 0;
    return false;
  }, [isLive, hours, amount, connected, isCompleted, isUpcoming]);

  const greedButtonText = useMemo(() => {
    if (!connected) return 'Connect Wallet';
    if (isCompleted) return 'Distribution';
    return 'Greed it!';
  }, [connected, isCompleted]);

  useEffect(() => {
    const solAmount = new Big(amount || '0');

    if (solAmount.gt(0) && Number(hours) > 0) {
      const solLamports = solAmount.times(new Big(10).pow(SOL_DECIMALS));

      const userGreed = calculateUserGreed(
        solLamports,
        Number(hours),
        hoursRangeMin,
        hoursRangeMax,
      );

      const maxGreed = calculateUserGreed(solLamports, hoursRangeMax, hoursRangeMin, hoursRangeMax);

      const isFirst = new Big(sale.stats.participationCount).eq(0);
      const expectedAmount = isFirst
        ? calculateRewardFirst(
            new Big(userGreed),
            solLamports,
            new Big(sale.depositedAmount).plus(solLamports),
            new Big(sale.targetDeposit),
            new Big(maxGreed),
          )
        : calculateReward(
            new Big(userGreed),
            solLamports,
            new Big(sale.totalGreed).plus(new Big(userGreed)),
            new Big(sale.depositedAmount).plus(solLamports),
            new Big(sale.targetDeposit),
          );
      setGreedOutcome(expectedAmount.toString());
    } else {
      setGreedOutcome('0');
    }
  }, [
    hours,
    amount,
    sale.totalGreed,
    hoursRangeMin,
    hoursRangeMax,
    sale.targetDeposit,
    sale.depositedAmount,
    sale.stats.participationCount,
  ]);

  useEffect(() => {
    if (connected && publicKey) {
      GreedySalesService.getSolBalance(publicKey).then(setSolBalance);
      const interval = setInterval(() => {
        GreedySalesService.getSolBalance(publicKey).then(setSolBalance);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  return (
    <div className="flex flex-1 flex-col gap-6 lg:gap-8 w-full">
      <div className="flex flex-col gap-2 w-full">
        <h2 className="text-[18px] lg:text-2xl font-bold">Pick Your Greed Level</h2>
      </div>

      <div className="relative flex flex-col gap-8 w-full">
        <div className="flex flex-col gap-2 w-full">
          <p className="text-[18px] font-semibold mb-2">Amount</p>
          <div className="flex flex-row gap-2 w-full">
            <p className="text-xs md:text-sm text-secondary-text font-secondary">
              Allowed range: {SALE_SOL_MIN} – {SALE_SOL_MAX} SOL
            </p>
            <p className="text-xs md:text-sm text-secondary-text font-secondary ml-auto">
              Balance:{' '}
              <span className="font-normal text-white">{solBalance.formattedAmount || 0} SOL</span>
            </p>
          </div>
          <div className="relative flex flex-row gap-2 w-full">
            <input
              type="number"
              min="0"
              step="0.0001"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter SOL amount"
              className="greed-input placeholder-secondary rounded-xl text-xl"
            />
            <div className="absolute flex items-center flex-row gap-1 sm:gap-2 text-sm sm:text-xl font-secondary font-semibold text-white sm:right-4 right-2 top-1/2 translate-y-[-50%] cursor-default">
              <p>SOL</p>
              <button
                onClick={handleMaxAmount}
                className="secondary-button px-2 py-1 sm:px-4 sm:py-2 text-sm">
                MAX
              </button>
            </div>
            {!!amountError && (
              <span className="absolute -bottom-5 left-1 text-xs text-fail font-medium font-secondary">
                {amountError}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p>Claim Time</p>
          <div className="relative flex flex-row gap-2 w-full">
            <input
              type="number"
              min={hoursRangeMin}
              max={hoursRangeMax}
              value={hours}
              onChange={handleHoursChange}
              className="greed-input placeholder-secondary"
              placeholder="0"
            />
            <p className="absolute text-2xl font-secondary font-bold text-secondary-text right-4 top-1/2 translate-y-[-50%] cursor-default">
              hours
            </p>
            <input
              type="range"
              min={hoursRangeMin}
              max={hoursRangeMax}
              step="1"
              value={Number(hours) || 0}
              onChange={(e) => setHours(e.target.value)}
              className="greed-range"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full mt-8 lg:mt-4">
        <AirdropGreedLevel hours={Number(hours)} />

        <div className="order-1 lg:order-none lg:flex-row lg:mt-0 mt-4 container-bg-dark flex-col gap-4 w-full">
          <div className="flex items-center justify-center flex-col gap-4 w-[80%]">
            <p className="text-md font-secondary font-light text-secondary-text text-center">
              Estimated Reward:
            </p>
            <h2 className="text-[28px] font-semibold text-center">
              ≈ {getAmountFormatted(greedOutcome, SALE_TOKEN_DECIMALS, 3)}{' '}
              {tokenMetadata && (
                <span className="text-secondary-text uppercase">{tokenMetadata?.symbol}</span>
              )}
            </h2>
          </div>
          <img
            className="w-[166px] h-[166px] min-w-[166px] min-h-[166px]"
            src={greedImage}
            alt=""
          />
        </div>

        <button
          className={classNames(connected ? 'primary-button' : 'secondary-light-button')}
          onClick={handleGreed}
          disabled={isGreedButtonDisabled}>
          {greedButtonText}
        </button>

        {connected && (
          <p className="text-sm text-secondary-text font-secondary">
            *Reward is estimated and may vary depending on the actual amount of participants.
          </p>
        )}
      </div>
    </div>
  );
};

export default AirdropGreedSelect;
