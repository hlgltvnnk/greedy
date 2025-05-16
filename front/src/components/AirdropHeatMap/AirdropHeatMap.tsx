import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  BarProps,
} from 'recharts';
import { useMediaQuery } from 'react-responsive';
import { CategoricalChartState } from 'recharts/types/chart/types';
import { Big } from 'big.js';
import classNames from 'classnames';
import { useTokensStore } from '../../store/useTokensStore';
import HeatMapTooltip from './HeatMapTooltip';
import {
  calculateRewardFirst,
  calculateUserGreed,
  formatHeatMapYAxisValue,
} from '../../utils/airdrops';
import { CustomActiveBar, RoundedBar } from './Bar';
import { CustomTickX, CustomTickY } from './Tick';
import { useSaleStore } from '../../store/useSaleStore';
import { ISale } from '../../interfaces/airdrops';
import {
  SALE_MULTIPLIER,
  SALE_TOKEN_DECIMALS,
  SALE_TOKENS_DISTRIBUTION,
} from '../../constants/sale';

interface IAirdropHeatMapProps {
  sale: ISale;
  className?: string;
}

interface RoundedBarProps extends BarProps {
  payload?: {
    rangeStart?: number;
    rangeEnd?: number;
    hour?: string;
  };
}

const AirdropHeatMap: React.FC<IAirdropHeatMapProps> = ({ sale, className }) => {
  const isMobile = useMediaQuery({ maxWidth: 640 });
  const [expandedRange, setExpandedRange] = useState<string | null>(null);
  const [mobileTooltipData, setMobileTooltipData] = useState<{
    label: string;
    amount: number;
  } | null>();
  const tokenMetadata = useTokensStore((state) => state.getMetadata(sale.mint));
  const participant = useSaleStore((state) => state.participants.get(sale.id));
  const hours = participant?.claimHour || 0;

  const tokenSymbol = tokenMetadata?.symbol || '';

  const unlockPacks: [number, number][] = useMemo(() => {
    const statsRaw = Object.entries(sale?.stats?.stats || {}).map(([hourStr, solStr]) => {
      const hour = Number(hourStr) + 1;
      const sol = new Big(solStr).div(new Big(10).pow(SALE_TOKEN_DECIMALS));
      return [hour, sol] as [number, Big];
    });

    const getMultiplier = (hour: number) => new Big(SALE_MULTIPLIER).plus(new Big(hour).div(100));

    const isSingleUser = new Big(sale.stats.participationCount).eq(1);

    if (isSingleUser) {
      const [[hour, sol]] = statsRaw;
      const userGreed = calculateUserGreed(
        new Big(sol).times(new Big(10).pow(SALE_TOKEN_DECIMALS)),
        hour,
        sale.unlockRange[0],
        sale.unlockRange[1],
      );
      const maxGreed = calculateUserGreed(
        new Big(sol).times(new Big(10).pow(SALE_TOKEN_DECIMALS)),
        sale.unlockRange[1],
        sale.unlockRange[0],
        sale.unlockRange[1],
      );

      const reward = calculateRewardFirst(
        new Big(userGreed),
        new Big(sol).times(new Big(10).pow(SALE_TOKEN_DECIMALS)),
        new Big(sale.depositedAmount),
        new Big(sale.targetDeposit),
        new Big(maxGreed),
      );
      return [[hour, reward.toNumber()]];
    } else {
      const depositedAmount = new Big(sale.depositedAmount).div(
        new Big(10).pow(SALE_TOKEN_DECIMALS),
      );
      const targetDeposit = new Big(sale.targetDeposit).div(new Big(10).pow(SALE_TOKEN_DECIMALS));

      const isTargetReached = new Big(sale.depositedAmount).gte(sale.targetDeposit);
      const distributed = isTargetReached
        ? SALE_TOKENS_DISTRIBUTION
        : SALE_TOKENS_DISTRIBUTION.mul(depositedAmount.div(targetDeposit));

      const greeds = statsRaw.map(([hour, sol]) => sol.times(getMultiplier(hour)));
      const totalGreed = greeds.reduce((acc, g) => acc.plus(g), new Big(0));

      return statsRaw.map(([hour, sol]) => {
        const greed = sol.times(getMultiplier(hour));
        const tokenAmount = totalGreed.gt(0) ? distributed.mul(greed).div(totalGreed) : new Big(0);
        return [hour, tokenAmount.toNumber()] as [number, number];
      });
    }
  }, [
    sale?.stats?.stats,
    sale.depositedAmount,
    sale.targetDeposit,
    sale.stats.participationCount,
    sale.unlockRange,
  ]);

  const getRangeKey = (hour: number) => {
    if (hour <= 0) return '1-10';
    const rangeStart = Math.floor((hour - 1) / 10) * 10 + 1;
    const rangeEnd = rangeStart + 9;
    return `${rangeStart}-${rangeEnd}`;
  };

  const handleBarClick = (hour: string) =>
    setExpandedRange((prev) => (prev === hour ? null : hour));

  const chartData = (() => {
    if (!expandedRange) {
      const grouped: Record<string, Big> = {};

      for (let i = 0; i < 100; i += 10) {
        const label = `${i + 1}-${i + 10}`;
        grouped[label] = new Big(0);
      }

      unlockPacks.forEach(([hour, amount]) => {
        const rangeKey = getRangeKey(hour);
        if (!grouped[rangeKey]) {
          grouped[rangeKey] = new Big(0);
        }
        grouped[rangeKey] = grouped[rangeKey].plus(new Big(amount));
      });

      const selectedRangeKey = getRangeKey(hours);
      if (!(selectedRangeKey in grouped)) {
        grouped[selectedRangeKey] = new Big(0);
      }

      return Object.entries(grouped).map(([range, value], index) => {
        const [start, end] = range.split('-').map(Number);
        return {
          index,
          hour: range,
          rangeStart: start,
          rangeEnd: end,
          amount: parseFloat(new Big(value).div(Big(10).pow(SALE_TOKEN_DECIMALS)).toFixed(2)),
        };
      });
    } else {
      const [start, end] = expandedRange.split('-').map(Number);
      const individual: Record<number, Big> = {};

      for (let i = start; i <= end; i++) {
        individual[i] = new Big(0);
      }

      unlockPacks.forEach(([hour, amount]) => {
        if (hour >= start && hour <= end) {
          individual[hour] = individual[hour].plus(new Big(amount));
        }
      });

      return Object.entries(individual).map(([hour, value], index) => ({
        index,
        hour,
        rangeStart: +hour,
        rangeEnd: +hour,
        amount: parseFloat(new Big(value).div(Big(10).pow(SALE_TOKEN_DECIMALS)).toFixed(2)),
      }));
    }
  })();

  const getBarFill = (payload?: { rangeStart?: number; rangeEnd?: number }) => {
    if (!payload) return '#2A383D';
    if (hours >= (payload.rangeStart || 0) && hours <= (payload.rangeEnd || 0)) {
      return '#5E94A6';
    }
    return '#2A383D';
  };

  const defaultData = chartData.find((item) => hours >= item.rangeStart && hours <= item.rangeEnd);

  const handleBarChartClick = (e: CategoricalChartState | null): void => {
    if (!isMobile || !e?.activeLabel) return;

    const label = e.activeLabel as string;

    const found = chartData.find((d) => d.hour === label);

    if (found) {
      setMobileTooltipData({ label: found.hour, amount: found.amount });
    }
  };

  if (!sale) return null;

  return (
    <div className={classNames('flex flex-1 flex-col gap-2 w-full', className)}>
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-[18px] font-primary font-semibold text-[#FFFFFF]">Greedy Heatmap</h3>
        <p className="text-sm font-secondary text-[#96B9C5]">
          Token volume locked per wait-time option
        </p>
      </div>

      {isMobile && (
        <HeatMapTooltip
          className="mb-8"
          active={true}
          label={mobileTooltipData ? mobileTooltipData?.label : defaultData?.hour}
          amount={mobileTooltipData ? mobileTooltipData?.amount : defaultData?.amount}
          tokenSymbol={tokenSymbol}
          isMobile
        />
      )}

      <div className="flex relative">
        {expandedRange && (
          <button
            onClick={() => setExpandedRange(null)}
            className={classNames(
              'absolute flex items-center gap-1 text-sm font-medium text-white underline transition z-1 font-secondary',
              isMobile ? '-top-8 -left-0' : 'top-2 left-2',
            )}>
            <img src="/images/arrow-left.png" alt="back" className="w-4 h-4" />
            <span>Back to overview</span>
          </button>
        )}
        <ResponsiveContainer
          width="100%"
          height={328}
          style={{
            backgroundColor: '#0F181B',
            borderRadius: 16,
            border: '1px solid #030201',
          }}>
          <BarChart
            data={chartData}
            margin={{ top: 56, left: 16, right: 16, bottom: 16 }}
            onClick={handleBarChartClick}>
            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={<CustomTickX />} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={<CustomTickY />}
              tickFormatter={formatHeatMapYAxisValue}
            />
            <Bar
              dataKey="amount"
              shape={(props: RoundedBarProps) => (
                <RoundedBar
                  {...props}
                  fill={getBarFill(props.payload)}
                  onClick={!expandedRange ? (hour: string) => handleBarClick(hour) : undefined}
                />
              )}
              activeBar={(props: BarProps) => (
                <CustomActiveBar
                  {...props}
                  onClick={!expandedRange ? (hour: string) => handleBarClick(hour) : undefined}
                  activeHeight={328 - 56 - (isMobile ? 32 : 24)}
                />
              )}
              minPointSize={5}
            />
            <Tooltip
              content={(props: TooltipProps<string, string>) =>
                isMobile ? null : (
                  <HeatMapTooltip
                    active={props.active}
                    label={props.label}
                    amount={Number(props.payload?.[0]?.value)}
                    tokenSymbol={tokenSymbol}
                  />
                )
              }
              cursor={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AirdropHeatMap;
