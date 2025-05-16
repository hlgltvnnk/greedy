import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { formatDateTime, formatTimeUntilFull } from '../../utils/date';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { useAirdropStatus } from '../../hooks/useAirdropStatus';
import ProgressBar from '../ProgressBar/ProgressBar';
import { useTokensStore } from '../../store/useTokensStore';
import { getValidIcon } from '../../utils/airdrops';
import { useSaleStore } from '../../store/useSaleStore';
import { useNowMs } from '../../hooks/useNowMs';
import { getAmountFormatted } from '../../utils/core';
import { SALE_TOKEN_DECIMALS, SALE_TOKENS_DISTRIBUTION } from '../../constants/sale';

interface IAirdropCardItemProps {
  sale: ISale;
}

const AirdropCardItem: React.FC<IAirdropCardItemProps> = ({ sale }) => {
  const navigate = useNavigate();
  const status = useAirdropStatus(sale);
  const participants = useSaleStore((state) => state.participants);
  const participant = participants.get(sale.id);
  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));

  const isLive = status === EAirdropStatus.LIVE;
  const isUpcoming = status === EAirdropStatus.UPCOMING;
  const isCompleted = status === EAirdropStatus.COMPLETED;
  const isFailed = status === EAirdropStatus.FAILED;

  const now = useNowMs(5_000);
  const unlockDate = sale?.endDate ? sale.endDate : null;
  const isUnlocked = unlockDate ? now > unlockDate.getTime() : false;

  const isClaimed = participant?.isClaimed;
  const isClaimable = isUnlocked && !isClaimed;

  const getAirdropLeftTime = () => {
    if (isLive) return sale?.endDate ? formatTimeUntilFull(sale?.endDate, true) : 'Not announced';
    if (isCompleted || isFailed)
      return sale?.endDate ? formatDateTime(sale?.endDate) : 'Not announced';
    return sale?.startDate ? formatTimeUntilFull(sale?.startDate, true) : 'Not announced';
  };

  const buttonText = useMemo(() => {
    if (participant) {
      if (isFailed && !isClaimed) return 'Chargeback';
      if (isClaimed) return 'Claimed';
      if (isClaimable) return 'Claim';
      if (isCompleted) return 'Distribution';
      return 'Wait for distribution';
    }
    if (isCompleted) return 'Distribution';
    return 'Join';
  }, [isClaimed, participant, isCompleted, isClaimable, isFailed]);

  const showButton = useMemo(() => {
    if (isUpcoming) return false;
    if (isFailed && !participant) return false;
    if (isFailed && isClaimed) return false;
    return true;
  }, [isUpcoming, isFailed, participant, isClaimed]);

  return (
    <div
      className={classNames('airdrop-card items-start lg:gap-8 xl:gap-16', {
        'opacity-50': participant && !isClaimed ? false : isCompleted || isFailed,
      })}
      key={sale.id}
      onClick={() => navigate(`/sale/${encodeURIComponent(sale.id)}`)}>
      <div className="airdrop-card__header flex lg:flex-grow-0 flex-row items-center gap-2 lg:gap-6 lg:w-[315px] w-full">
        <img
          src={getValidIcon(tokenMetadata?.image)}
          alt={sale.name}
          className="w-[54px] h-[54px] min-w-[54px] min-h-[54px] rounded-xl"
        />
        <div className="flex flex-col gap-1 lg:gap-3 w-full">
          <div className="flex flex-row items-center gap-2">
            <p className="text-white text-base lg:text-lg line-clamp-2 break-all">{sale?.name}</p>
            <p
              className={classNames('badge', {
                'badge--success': isLive,
                'badge--danger': isUpcoming,
                'badge--completed': isCompleted,
                'badge--failed': isFailed,
              })}>
              {isLive ? 'Live' : isUpcoming ? 'Upcoming' : isCompleted ? 'Completed' : 'Failed'}
            </p>
          </div>
          {tokenMetadata && <p className="token-symbol">{tokenMetadata.symbol || ''}</p>}
        </div>
      </div>

      <div className="flex w-full lg:w-max lg:flex-grow-0 justify-between lg:flex-col lg:gap-3">
        <h3 className="flex items-center flex-row gap-2 text-secondary-text font-secondary font-medium text-[12px] lg:text-sm/[100%] whitespace-nowrap">
          <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/date.png" alt="Pool" />
          {isUpcoming ? 'Opens in:' : isLive ? 'Ends in:' : 'Ended at:'}
        </h3>
        <p className="text-sm lg:text-lg font-bold text-right lg:text-left">
          <span dangerouslySetInnerHTML={{ __html: getAirdropLeftTime() }} />
        </p>
      </div>

      {isUpcoming ? (
        <div className="flex w-full lg:w-max lg:flex-grow-0 justify-between lg:flex-col lg:gap-3">
          <h3 className="flex items-center flex-row gap-2 text-secondary-text font-secondary font-medium text-[12px] lg:text-sm/[100%]">
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/pool.png" alt="Pool" />
            Token Pool Size:
          </h3>
          <p className="text-sm lg:text-lg font-bold text-right lg:text-left">
            {getAmountFormatted(SALE_TOKENS_DISTRIBUTION, SALE_TOKEN_DECIMALS)}{' '}
            {tokenMetadata && <span className="token-symbol">{tokenMetadata.symbol || ''}</span>}
          </p>
        </div>
      ) : (
        <ProgressBar
          saleId={sale.id}
          className="w-full px-0! py-0! bg-transparent border-none lg:max-w-[294px]"
        />
      )}

      {!!showButton && (
        <button className="primary-button ml-auto my-auto w-full lg:w-[158px]">{buttonText}</button>
      )}
    </div>
  );
};

export default AirdropCardItem;
