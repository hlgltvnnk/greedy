import React, { memo } from 'react';
import classNames from 'classnames';
import { EAirdropStatus } from '../../interfaces/airdrops';
import { getValidIcon } from '../../utils/airdrops';
import { useTokensStore } from '../../store/useTokensStore';
import { useAirdropStatus } from '../../hooks/useAirdropStatus';
import ProgressBar from '../ProgressBar/ProgressBar';
import { AirdropEnds } from '../index';
import { ISale } from '../../interfaces/airdrops';
import { SALE_TOKEN_DECIMALS, SALE_TOKENS_DISTRIBUTION } from '../../constants/sale';
import { getAmountFormatted } from '../../utils/core';
import TokenAddress from '../TokenAddress/TokenAddress';

interface AirdropInfoProps {
  sale: ISale;
}

const AirdropInfo: React.FC<AirdropInfoProps> = ({ sale }) => {
  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));
  const status = useAirdropStatus(sale);

  const totalAmount = getAmountFormatted(SALE_TOKENS_DISTRIBUTION, SALE_TOKEN_DECIMALS);

  return (
    <div className="paper flex flex-1 flex-col xl:gap-6 lg:gap-4 gap-2 w-full min-w-0">
      <div className="flex relative justify-between gap-4 flex-col lg:flex-row flex-wrap">
        <div className="flex flex-row gap-4 items-center w-full">
          <img
            className="w-14 h-14 min-w-14 min-h-14 lg:w-20 lg:h-20 lg:min-w-20 lg:min-h-20 rounded-xl"
            src={getValidIcon(tokenMetadata?.image)}
            alt="Score"
          />
          <div className="flex lg:justify-center justify-between flex-col gap-1 lg:gap-2 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="line-clamp-2 break-all max-w-[250px]">{sale?.name}</span>
              <p className="token-symbol text-xs!">{tokenMetadata?.symbol}</p>
              <p
                className={classNames(
                  'badge relative font-primary text-[10px]lg:text-sm font-normal ml-auto',
                  {
                    'badge--success': status === EAirdropStatus.LIVE,
                    'badge--danger': status === EAirdropStatus.UPCOMING,
                    'badge--completed': status === EAirdropStatus.COMPLETED,
                    'badge--failed': status === EAirdropStatus.FAILED,
                  },
                )}>
                {status}
              </p>
            </div>
            <div className="md:flex hidden items-center gap-2">
              <TokenAddress tokenAddress={sale?.mint.toString()} />
              <AirdropEnds saleId={sale?.id} className="w-fit! ml-auto" />
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between flex-wrap md:hidden gap-2">
          <TokenAddress tokenAddress={sale.mint.toString()} />
          <AirdropEnds saleId={sale.id} className="w-fit!" />
        </div>
      </div>

      <p className="text-[#96B9C5] text-sm font-secondary font-normal w-full break-words">
        {sale.description}
      </p>

      <div className="flex flex-col xl:flex-row gap-2 lg:gap-4">
        <div className="container-bg-dark p-3 flex flex-row xl:flex-col justify-between xl:justify-center xl:w-fit flex-none w-full xl:max-w-[171px] max-w-none">
          <h3 className="flex items-center justify-center text-center flex-row gap-2  text-secondary-text font-secondary font-medium text-[12px] lg:text-sm/[100%]">
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/pool.png" alt="Pool" />
            Token Pool Size:
          </h3>
          <p className="flex items-center justify-center flex-wrap gap-1 text-lg font-semibold text-right lg:text-center text-[14px] lg:text-[18px]">
            {totalAmount}{' '}
          </p>
        </div>

        <ProgressBar saleId={sale?.id} />
      </div>
    </div>
  );
};

export default memo(AirdropInfo);
