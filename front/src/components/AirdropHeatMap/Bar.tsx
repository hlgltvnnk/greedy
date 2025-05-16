import { BarProps } from 'recharts';

interface ICustomActiveBarProps extends Partial<BarProps> {
  onClick?: (hour: string) => void;
  payload?: { hour?: string };
  activeHeight?: number;
}

interface ICustomRoundedBarProps extends Partial<BarProps> {
  onClick?: (hour: string) => void;
  payload?: { hour?: string };
}

export const RoundedBar: React.FC<ICustomRoundedBarProps> = (props) => {
  const { x, y, width, height, payload } = props;
  const hour = payload?.hour;

  return (
    <g onClick={() => hour && props.onClick?.(hour)} style={{ cursor: 'pointer' }}>
      <defs>
        <pattern id="barPatternActive" patternUnits="userSpaceOnUse" width="20" height="20">
          <image href="/images/bar-image.png" x="0" y="0" width="20" height="20" />
        </pattern>
      </defs>

      <rect x={x} y={y} width={width} height={height} rx={8} ry={8} fill="#2A383D" opacity={0.5} />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill="url(#barPatternActive)"
        opacity={0.04}
      />
    </g>
  );
};

export const CustomActiveBar: React.FC<ICustomActiveBarProps> = (props) => {
  const { x, width, payload, fill } = props;
  const hour = payload?.hour;

  const adjustedY =
    (Number(props?.y) || 0) + (Number(props?.height) || 0) - (Number(props.activeHeight) || 0); // малюємо вгору

  return (
    <g onClick={() => hour && props.onClick?.(hour)} style={{ cursor: 'pointer' }}>
      <defs>
        <pattern id="barPatternActive" patternUnits="userSpaceOnUse" width="20" height="20">
          <image href="/images/bar-image.png" x="0" y="0" width="20" height="20" />
        </pattern>
      </defs>

      <rect
        x={x}
        y={adjustedY}
        width={width}
        height={props.activeHeight}
        rx={8}
        ry={8}
        fill="#2A383D"
        opacity={0.5}
      />
      <rect
        x={x}
        y={adjustedY}
        width={width}
        height={props.activeHeight}
        rx={8}
        ry={8}
        fill="url(#barPatternActive)"
        opacity={0.04}
      />

      <rect
        x={x}
        y={props.y}
        width={width}
        height={props.height}
        rx={8}
        ry={8}
        fill={fill || '#5E94A6'}
      />
    </g>
  );
};
