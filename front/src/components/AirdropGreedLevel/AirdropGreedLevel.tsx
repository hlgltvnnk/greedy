import React from 'react';
import { getGreedLevel } from '../../utils/airdrops';

interface IAirdropGreedLevelProps {
  hours: number;
}

const AirdropGreedLevel: React.FC<IAirdropGreedLevelProps> = ({ hours }) => {
  const { label, color } = getGreedLevel(hours);

  return (
    <p className="text-sm font-secondary font-medium text-secondary-text">
      Greed Level:{' '}
      <span className="font-primary font-semibold" style={{ color }}>
        {label}
      </span>
    </p>
  );
};

export default AirdropGreedLevel;
