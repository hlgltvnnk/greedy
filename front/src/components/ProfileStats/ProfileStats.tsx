import { FC, memo } from 'react';
import { useSaleStore } from '../../store/useSaleStore';
import { getGreedLevel } from '../../utils/airdrops';
import { BN } from '@coral-xyz/anchor';
import { SOL_DECIMALS } from '../../constants/core';
import { getAmountFormatted } from '../../utils/core';

const ProfileStats: FC = () => {
  const participants = useSaleStore((s) => s.participants);

  const totalInvested = Array.from(participants.values()).reduce((acc, participant) => {
    return acc.add(participant.depositedAmount);
  }, new BN(0));

  const maxHour = Array.from(participants.values()).reduce((max, participant) => {
    return Math.max(max, participant.claimHour);
  }, 0);

  const { label: greediestLevel } = getGreedLevel(maxHour);

  const totalInvestedFormatted = getAmountFormatted(totalInvested, SOL_DECIMALS);
  return (
    <div className="paper bg-[#1D2F34] flex flex-col gap-4 min-w-[305px]">
      <h2 className="text-lg/[100%] font-semibold">Statistic</h2>
      <div className="flex flex-col gap-4 w-full lg:flex-row">
        <div className="flex flex-col gap-4 flex-1">
          <div className="bg-[#0F181B] rounded-2xl p-4 flex flex-row items-center gap-1 border border-solid border-[#0F181B]">
            <img src="/images/airdrop/sol.svg" alt="sol" className="w-4 h-4" />
            <div>
              <span className="text-[#96B9C5] text-sm/[100%] font-secondary">Total Invested:</span>
              <span className="font-primary ml-4 font-semibold text-lg/[100%]">
                {totalInvestedFormatted} <span className="text-white opacity-40">SOL</span>
              </span>
            </div>
          </div>
          <div className="bg-[#0F181B] rounded-2xl p-4 flex flex-row items-center gap-1 border border-solid border-[#0F181B]">
            <img className="w-4 h-4 min-w-4 min-h-4" src="/images/airdrop/greed.svg" alt="" />
            <div>
              <span className="text-[#96B9C5] text-sm/[100%] font-secondary">Greediest Level:</span>
              <span className="font-primary ml-4 font-semibold text-lg/[100%]">
                {greediestLevel}
              </span>
            </div>
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-4 flex-1 opacity-40 bg-[#0F181B] rounded-2xl p-4 border border-solid border-[#030201]">
          <div className="flex flex-col items-center justify-center gap-4 mr-auto">
            <p className="flex flex-row items-center gap-1 text-sm/[100%] text-[#96B9C5] font-secondary">
              <img src="/images/airdrop/time.png" alt="time" className="w-4 h-4 min-w-4 min-h-4" />
              Average Claim Time
            </p>
            <span className="w-fit bg-[#96B9C533] px-3 py-1 rounded-full font-secondary font-semibold text-xs/[100%] text-[#8EAFBB]">
              Soon
            </span>
          </div>
          <img
            src="/images/statistics.png"
            alt="stats"
            className="absolute -bottom-[20px] right-[18px] w-[128px] h-[162px]"
          />
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileStats);
