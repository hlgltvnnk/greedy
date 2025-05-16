import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getAirdropStatus, getValidIcon } from '../../utils/airdrops';
import { EAirdropStatus, ISale } from '../../interfaces/airdrops';
import { useTokensStore } from '../../store/useTokensStore';
import { getAmountFormatted } from '../../utils/core';
import { formatTimeUntilFull } from '../../utils/date';
import { useNowMs } from '../../hooks/useNowMs';
import { SOL_DECIMALS } from '../../constants/core';
import ProgressBar from '../ProgressBar/ProgressBar';
import OpenPoolButton from '../OpenPoolButton/OpenPoolButton';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';

interface ISaleItemProps {
  sale: ISale;
}

const SaleItemCreated: React.FC<ISaleItemProps> = ({ sale }) => {
  const navigate = useNavigate();
  const now = useNowMs();
  const status = getAirdropStatus(sale, now);
  const showModal = useModalStore((state) => state.showModal);

  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));

  const isFailed = status === EAirdropStatus.FAILED;
  const isUpcoming = status === EAirdropStatus.UPCOMING;
  const isCompleted = status === EAirdropStatus.COMPLETED;
  const isLive = status === EAirdropStatus.LIVE;

  const getAirdropLeftTime = () => {
    if (isUpcoming) {
      return sale.startDate ? formatTimeUntilFull(sale.startDate, true) : 'Not announced';
    }
    return sale.endDate ? formatTimeUntilFull(sale.endDate, true) : 'Not announced';
  };

  const isOpacity = isCompleted || isFailed;

  const onEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    showModal(EModals.CREATE_SALE, {
      sale,
      showConnectWallet: () => showModal(EModals.CONNECT_WALLET),
      showSuccess: (saleId) => showModal(EModals.CREATE_SALE_SUCCESS, { saleId }),
    });
  };

  return (
    <div
      key={sale.id}
      className={classNames('sale-card-created')}
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

      {isFailed || isCompleted ? (
        <div className="sale-card__status flex items-center justify-between lg:flex-grow-0 lg:flex-row xl:flex-col gap-5">
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
              isCompleted ? 'text-success' : 'text-fail',
            )}>
            {isCompleted ? 'Success' : 'Fail'}
          </p>
        </div>
      ) : (
        <div className="sale-card__status flex items-center justify-between lg:flex-row xl:flex-col gap-5">
          <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/date.png" alt="Pool" />
            {isLive ? 'Ends In:' : 'Starts In:'}
          </h3>
          <p
            className="text-sm/[100%] font-semibold text-center"
            dangerouslySetInnerHTML={{ __html: getAirdropLeftTime() }}
          />
        </div>
      )}

      <div
        className={classNames(
          'sale-card__participants flex items-center justify-between lg:flex-grow-0 lg:flex-row xl:flex-col gap-5',
          isOpacity && 'opacity-40',
        )}>
        <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
          <img
            className="w-4 h-4 min-w-4 min-h-4"
            src="/images/airdrop/participants.png"
            alt="Pool"
          />
          Participants:
        </h3>
        <p className="text-sm/[100%] font-semibold">
          {sale?.stats?.participationCount?.toString()}
        </p>
      </div>

      <div
        className={classNames(
          'sale-card__raised flex items-center justify-between  lg:flex-grow-0 lg:flex-row xl:flex-col gap-5',
          isOpacity && 'opacity-40',
        )}>
        <h3 className="flex items-center flex-row gap-1 text-secondary-text font-secondary text-sm/[100%] whitespace-nowrap">
          <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/sol.svg" alt="Pool" />
          Total Raised:
        </h3>
        <p className="text-sm/[100%] font-semibold">
          {getAmountFormatted(sale.depositedAmount, SOL_DECIMALS)}
          <span className="text-white opacity-40 ml-1">SOL</span>
        </p>
      </div>

      {!isUpcoming && (
        <div className="sale-card__progress">
          <ProgressBar
            saleId={sale.id}
            title={isLive ? 'Current Lock Progress:' : 'Total Raised:'}
            className={classNames(
              'w-full px-0! py-0! bg-transparent border-none',
              isOpacity && 'opacity-40',
            )}
          />
        </div>
      )}

      {isCompleted ? (
        <OpenPoolButton tokenId={sale.mint.toBase58()} />
      ) : !isLive && !isFailed ? (
        <button
          onClick={onEditClick}
          className={classNames(
            'sale-card__button primary-button w-full max-w-[180px] ml-auto h-[54px]',
            isUpcoming ? 'bg-secondary-light-button text-[#030201] text-lg/[100%] font-normal' : '',
          )}>
          Edit
        </button>
      ) : null}
    </div>
  );
};

export default memo(SaleItemCreated);
