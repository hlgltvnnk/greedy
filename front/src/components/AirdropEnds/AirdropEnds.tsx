import { memo, useMemo } from 'react';
import classNames from 'classnames';
import { useAirdropStatus } from '../../hooks/useAirdropStatus';
import { EAirdropStatus } from '../../interfaces/airdrops';
import { formatDateTime, formatTimeUntilFull } from '../../utils/date';
import { useSaleStore } from '../../store/useSaleStore';

interface IAirdropEndsProps {
  saleId: string;
  className?: string;
}

const AirdropEnds: React.FC<IAirdropEndsProps> = ({ saleId, className }) => {
  const sale = useSaleStore((s) => s.sales.get(saleId));
  const status = useAirdropStatus(sale);

  const isLive = status === EAirdropStatus.LIVE;
  const isCompleted = status === EAirdropStatus.COMPLETED;
  const isUpcoming = status === EAirdropStatus.UPCOMING;
  const isFailed = status === EAirdropStatus.FAILED;

  const airdropLeftTime = useMemo(() => {
    if (!sale) return 'Not announced';
    if (isFailed || isCompleted) return formatDateTime(sale?.endDate);
    if (isLive) return formatTimeUntilFull(sale?.endDate, true);
    if (isUpcoming) return formatTimeUntilFull(sale?.startDate, true);
    return 'Not announced';
  }, [sale, isFailed, isCompleted, isLive, isUpcoming]);

  return (
    <div
      className={classNames(
        'container-bg-light flex-none px-4 py-2 flex flex-row justify-between w-full',
        className,
      )}>
      <h3 className="flex items-center justify-center flex-row gap-1 text-xs text-secondary-text font-secondary font-medium whitespace-nowrap">
        <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/date.png" alt="Pool" />
        {status === EAirdropStatus.UPCOMING ? 'Opens in:' : isLive ? 'Ends In:' : 'Ended at:'}
      </h3>
      <p
        className="text-sm font-semibold text-center"
        dangerouslySetInnerHTML={{ __html: airdropLeftTime }}
      />
    </div>
  );
};

export default memo(AirdropEnds);
