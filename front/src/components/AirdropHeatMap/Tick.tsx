import { useMediaQuery } from 'react-responsive';
import { formatHeatMapYAxisValue } from '../../utils/airdrops';

export const CustomTickX = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const label = payload?.value || 0;
  const dx = isMobile ? -8 : 0;
  const dy = isMobile ? 4 : 0;

  return (
    <text
      x={x}
      y={(y || 0) + 10}
      dx={dx}
      dy={dy}
      transform={isMobile ? `rotate(-45, ${x}, ${y})` : ''}
      textAnchor="middle"
      fill="#999"
      fontWeight="normal"
      fontSize={isMobile ? 10 : 14}>
      {label}
    </text>
  );
};

export const CustomTickY = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: number };
}) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const label = formatHeatMapYAxisValue(payload?.value ?? 0);

  return (
    <text
      x={(x || 0) - 35}
      y={y}
      textAnchor="middle"
      fill="#999"
      fontWeight="normal"
      fontSize={isMobile ? 12 : 14}>
      {label}
    </text>
  );
};
