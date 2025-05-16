import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import {
  calculateReward,
  calculateRewardFirst,
  calculateUserGreed,
  getAirdropStatus,
  getGreedLevel,
  getValidIcon,
} from '../../utils/airdrops';
import Big from 'big.js';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { useSaleStore } from '../../store/useSaleStore';
import { useTokensStore } from '../../store/useTokensStore';
import { getAmountFormatted } from '../../utils/core';
import { SALE_TOKEN_DECIMALS } from '../../constants/sale';
import { formatTimeUntilFull } from '../../utils/date';
import { useNowMs } from '../../hooks/useNowMs';
import { SOL_DECIMALS } from '../../constants/core';
import OpenPoolButton from '../OpenPoolButton/OpenPoolButton';

interface ISaleItemProps {
  sale: ISale;
}

const SaleItem: React.FC<ISaleItemProps> = ({ sale }) => {
  const navigate = useNavigate();
  const now = useNowMs();
  const status = getAirdropStatus(sale, now);

  const participant = useSaleStore((s) => s.participants.get(sale.id));
  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));

  const isClaimed = participant?.isClaimed;
  const isFailed = status === EAirdropStatus.FAILED;
  const isCompleted = status === EAirdropStatus.COMPLETED;

  const greed = getGreedLevel(participant?.claimHour || 0);

  const lockedHoursMS = participant ? participant?.claimHour * 60 * 60 * 1000 : 0;
  const unlockDate = sale.endDate ? sale.endDate.getTime() + lockedHoursMS : null;
  const isUnlocked = unlockDate ? now > unlockDate : false;

  const getAirdropLeftTime = () => {
    if (!participant) return 'Not announced';
    if (isUnlocked) return 'Claim now';
    return unlockDate ? formatTimeUntilFull(unlockDate, true) : 'Not announced';
  };

  const getButtonText = () => {
    if (isFailed && !isClaimed) return 'Chargeback';
    if (isCompleted && isClaimed) return 'Claimed';
    if (isUnlocked) return 'Claim';
  };

  const showButton = useMemo(() => {
    if (isFailed && !isClaimed) return true;
    if (isFailed && isClaimed) return false;
    if (isClaimed) return false;
    if (isUnlocked) return true;
    return false;
  }, [isFailed, isClaimed, isUnlocked]);

  const isOpacity = isCompleted || isFailed;

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

  const amountToClaim = userReward || '0';

  return (
    <div
      key={sale.id}
      className={classNames('sale-card')}
      onClick={() => navigate(`/sale/${encodeURIComponent(sale.id)}`)}>
      <div
        className={classNames(
          'sale-card__header flex lg:flex-grow-0 flex-row items-center gap-2 lg:gap-6 lg:w-[315px] w-full',
          isOpacity && 'opacity-40',
        )}>
        <img
          src={getValidIcon(tokenMetadata?.image)}
          alt={sale.name}
          className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-xl"
        />
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-row items-start gap-2">
            <p className="text-white text-lg/[100%] font-semibold line-clamp-2 break-all">
              {sale?.name}
            </p>
          </div>
          <p className="token-symbol">{tokenMetadata?.symbol || ''}</p>
        </div>
      </div>

      {isClaimed || isFailed ? (
        <div className="flex items-center justify-between w-full lg:w-max lg:flex-grow-0 lg:flex-row xl:flex-col gap-5">
          <h3
            className={classNames(
              'flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap',
              isOpacity && 'opacity-40',
            )}>
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/status.svg" alt="Pool" />
            Sale Status:
          </h3>
          <p
            className={classNames(
              'text-sm/[100%] font-semibold text-center',
              isClaimed && isCompleted ? 'text-success' : 'text-fail',
            )}>
            {isClaimed && isCompleted ? 'Claimed' : 'Fail'}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between lg:flex-row xl:flex-col gap-5">
          <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/date.png" alt="Pool" />
            Claim In:
          </h3>
          <p
            className="text-sm/[100%] font-semibold text-center"
            dangerouslySetInnerHTML={{ __html: getAirdropLeftTime() }}
          />
        </div>
      )}

      <div
        className={classNames(
          'flex items-center justify-between w-full lg:w-max lg:flex-grow-0 lg:flex-row xl:flex-col gap-5',
          isOpacity && 'opacity-40',
        )}>
        <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
          <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/greed.svg" alt="" />
          Greed Level:
        </h3>
        <p className="text-sm/[100%] font-semibold">{greed.label}</p>
      </div>

      <div
        className={classNames(
          'flex items-center justify-between w-full lg:w-max lg:flex-grow-0 lg:flex-row xl:flex-col gap-5',
          isOpacity && 'opacity-40',
        )}>
        <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
          <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/sol.svg" alt="Pool" />
          Locked:
        </h3>
        <p className="text-sm/[100%] font-semibold">
          {getAmountFormatted(participant?.depositedAmount, SOL_DECIMALS)}
          <span className="text-white opacity-40 ml-1">SOL</span>
        </p>
      </div>

      <div
        className={classNames(
          'flex items-center justify-between w-full lg:w-max lg:flex-grow-0 lg:flex-row xl:flex-col gap-5',
          isOpacity && 'opacity-40',
        )}>
        <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
          <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/claimable.svg" alt="Pool" />
          Claimable:
        </h3>
        <p className="text-sm/[100%] font-semibold">
          {getAmountFormatted(amountToClaim || 0, SALE_TOKEN_DECIMALS)}
          <span className="text-white opacity-40 ml-1">{tokenMetadata?.symbol || ''}</span>
        </p>
      </div>

      {isCompleted && isClaimed && <OpenPoolButton tokenId={sale.mint.toBase58()} />}
      {showButton && (
        <button
          className={classNames(
            'primary-button w-full max-w-[180px] ml-auto',
            isFailed ? 'bg-secondary-light-button text-[#030201] text-lg/[100%] font-normal' : '',
          )}>
          {getButtonText()}
        </button>
      )}
    </div>
  );
};

export default memo(SaleItem);
