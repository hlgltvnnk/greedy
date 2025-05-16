import React from 'react';
import Big from 'big.js';
import classNames from 'classnames';
import { getAmountFormatted } from '../../utils/core';
import { SOL_DECIMALS } from '../../constants/core';
import { getLockedStats } from '../../utils/airdrops';
import { useSaleStore } from '../../store/useSaleStore';

interface IProgressBarProps {
  saleId: string;
  className?: string;
  title?: string;
}

const ProgressBar: React.FC<IProgressBarProps> = ({
  className,
  saleId,
  title = ' Current Lock Progress:',
}) => {
  const sales = useSaleStore((state) => state.sales);
  const sale = sales.get(saleId);

  const solAmount = sale?.depositedAmount || 0;
  const availableAmount = new Big(sale?.targetDeposit).sub(new Big(sale?.depositedAmount));
  const { lockedAmount, lockedPercent } = getLockedStats(
    sale?.targetDeposit.toString(),
    availableAmount.toString(),
  );

  const solAmountFormatted = getAmountFormatted(solAmount, SOL_DECIMALS);
  const lockedAmountFormatted = getAmountFormatted(lockedAmount, SOL_DECIMALS);

  const targetAmountFormatted = getAmountFormatted(sale?.targetDeposit, SOL_DECIMALS);

  return (
    <div
      className={classNames(
        'container-bg-dark px-4 py-3 rounded-xl flex flex-col items-start gap-2 w-full',
        className,
      )}>
      <div className="text-secondary-text font-secondary font-normal text-sm/[100%] flex flex-row items-center gap-2 mb-1">
        <img src="/images/airdrop/lock.png" className="w-4 h-4 min-w-4 min-h-4" />
        {title}
      </div>

      <div className="flex w-full flex-row items-center justify-between gap-1">
        <p className="flex flex-row items-center justify-center flex-wrap gap-1 text-white text-xs/[100%] font-medium">
          <span className="">{lockedPercent}%</span>
          <span className="w-[3px] h-[3px] bg-white rounded-full"></span>
          <span className="">{solAmountFormatted} SOL</span>
        </p>
        <p className="text-[#96B9C5] text-xs/[100%] font-medium">{targetAmountFormatted} SOL</p>
      </div>

      <div className="flex items-center w-full h-[14px] bg-[#2F4C55] rounded-full overflow-hidden border border-solid border-[#030201]">
        <div
          className="h-[14px] bg-white transition-all duration-300 rounded-2xl border border-solid border-[#030201]"
          style={{
            width: `${lockedPercent}%`,
            display: lockedAmountFormatted === '0' ? 'none' : 'block',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
