import React from 'react';
import classNames from 'classnames';
import AirdropGreedSelect from '../AirdropGreedSelect/AirdropGreedSelect';
import AirdropGreedClaim from '../AirdropGreedClaim/AirdropGreedClaim';
import { ISale } from '../../interfaces/airdrops';
import { useSaleStore } from '../../store/useSaleStore';

interface IAirdropGreedProps {
  sale: ISale;
}

const AirdropGreed: React.FC<IAirdropGreedProps> = ({ sale }) => {
  const isParticipating = useSaleStore((s) => s.participants.get(sale?.id));

  return (
    <div
      className={classNames(
        'paper flex h-fit xl:h-full flex-row gap-8 w-full min-w-[282px]',
        !isParticipating && 'lg:bg-paper bg-[#1D2F34]!',
        isParticipating && 'flex-col flex-wrap lg:flex-row',
      )}>
      {isParticipating ? <AirdropGreedClaim sale={sale} /> : <AirdropGreedSelect sale={sale} />}
    </div>
  );
};

export default AirdropGreed;
