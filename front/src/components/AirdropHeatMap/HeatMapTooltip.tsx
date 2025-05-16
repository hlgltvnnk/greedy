import React from 'react';
import classNames from 'classnames';
import { formatHeatMapYAxisValue } from '../../utils/airdrops';

const formatWaitTimeLabel = (label: string): string => {
  const isRange = label.includes('-');
  if (isRange) return `${label} hours`;

  const numeric = parseInt(label, 10);
  const unit = numeric === 1 ? 'hour' : 'hours';
  return `${numeric} ${unit}`;
};

interface IHeatMapTooltipProps {
  active?: boolean;
  label?: string;
  amount?: number;
  tokenSymbol?: string;
  className?: string;
  isMobile?: boolean;
}

const HeatMapTooltip: React.FC<IHeatMapTooltipProps> = ({
  active,
  label = '',
  amount,
  tokenSymbol,
  className,
  isMobile,
}) => {
  if (!active || amount == null) return null;

  return (
    <div
      className={classNames(
        'rounded-xl p-4 border border-solid text-sm text-secondary-text shadow-[0_4px_0_0_#030201]',
        isMobile ? 'bg-[#0F181B] border-[#030201]' : 'bg-[#243B42] border-[#2A383D]',
        className,
      )}>
      <div className="flex items-center gap-2">
        <img src="/images/airdrop/time.png" alt="icon" className="w-4 h-4" />
        <span className="text-secondary-text text-xs">Wait Time:</span>{' '}
        <span className={classNames('text-white', isMobile && 'ml-auto')}>
          {formatWaitTimeLabel(label)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <img src="/images/airdrop/locked.svg" alt="icon" className="w-4 h-4" />
        <span className="text-secondary-text text-xs">Locked:</span>{' '}
        <span className={classNames('text-white', isMobile && 'ml-auto')}>
          {formatHeatMapYAxisValue(amount)}{' '}
          <span className="text-[#E1EBEF] bg-[#142024] rounded-md px-2 py-1 text-xs">
            {tokenSymbol}
          </span>
        </span>
      </div>
    </div>
  );
};

export default HeatMapTooltip;
