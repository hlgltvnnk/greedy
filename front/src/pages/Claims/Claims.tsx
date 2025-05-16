import { useMemo } from 'react';
import { PageHeader, SaleSection } from '../../components';
import { useRedirectIfNotConnected } from '../../hooks/useRedirectIfNotConnected';
import { useSaleStore } from '../../store/useSaleStore';
import { getAirdropStatus } from '../../utils/airdrops';
import { useNowMs } from '../../hooks/useNowMs';
import { EAirdropStatus } from '../../interfaces/airdrops';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';
import { MyClaimsFilterOption, useAppStore } from '../../store/appStore';

const sectionTitles: Record<MyClaimsFilterOption, string> = {
  ALL: 'All Sales',
  PENDING: 'Pending',
  CLAIMABLE: 'Claimable',
  CLAIMED: 'Claimed',
  FAILED: 'Failed',
};

const filterOptions: MyClaimsFilterOption[] = ['ALL', 'PENDING', 'CLAIMABLE', 'CLAIMED', 'FAILED'];

const Claims: React.FC = () => {
  useRedirectIfNotConnected('/');

  const now = useNowMs();
  const salesMap = useSaleStore((s) => s.sales);
  const participants = useSaleStore((s) => s.participants);
  const selectedFilter = useAppStore((state) => state.selectedClaimFilter);
  const setSelectedFilter = useAppStore((state) => state.setSelectedClaimFilter);

  const userSales = useMemo(
    () => Array.from(salesMap.values()).filter((sale) => participants.has(sale.id)),
    [salesMap, participants],
  );

  const pendingSales = useMemo(
    () =>
      userSales.filter((sale) => {
        const participant = participants.get(sale.id);
        if (!participant) return false;
        const status = getAirdropStatus(sale, now);
        if (status === EAirdropStatus.FAILED) return false;
        const lockedMs = participant.claimHour * 60 * 60 * 1000;
        const unlockDate = sale.endDate ? sale.endDate.getTime() + lockedMs : null;
        return unlockDate ? now < unlockDate : false;
      }),
    [userSales, participants, now],
  );

  const claimableSales = useMemo(
    () =>
      userSales.filter((sale) => {
        const participant = participants.get(sale.id);
        if (!participant) return false;
        const lockedMs = participant.claimHour * 60 * 60 * 1000;
        const unlockDate = sale.endDate ? sale.endDate.getTime() + lockedMs : null;
        const isUnlocked = unlockDate ? now > unlockDate : false;
        const isCompleted = getAirdropStatus(sale, now) === EAirdropStatus.COMPLETED;
        return isUnlocked && isCompleted && !participant.isClaimed;
      }),
    [userSales, participants, now],
  );

  const claimedSales = useMemo(
    () =>
      userSales.filter((sale) => {
        const participant = participants.get(sale.id);
        const status = getAirdropStatus(sale, now);
        const claimed = participant?.isClaimed;
        return claimed || status === EAirdropStatus.FAILED;
      }),
    [userSales, participants, now],
  );

  const failedSales = useMemo(
    () => userSales.filter((sale) => getAirdropStatus(sale, now) === EAirdropStatus.FAILED),
    [userSales, now],
  );

  const sections = useMemo(() => {
    const all = [
      { key: 'PENDING' as MyClaimsFilterOption, data: pendingSales },
      { key: 'CLAIMABLE' as MyClaimsFilterOption, data: claimableSales },
      { key: 'CLAIMED' as MyClaimsFilterOption, data: claimedSales },
      { key: 'FAILED' as MyClaimsFilterOption, data: failedSales },
    ];
    if (selectedFilter === 'ALL') {
      return all.filter((sec) => sec.key !== 'FAILED');
    }
    return all.filter((sec) => sec.key === selectedFilter);
  }, [selectedFilter, pendingSales, claimableSales, claimedSales, failedSales]);

  const dropdownItems = useMemo(
    () =>
      filterOptions
        .filter((option) => option !== selectedFilter)
        .map((option) => ({
          label: sectionTitles[option],
          onClick: () => setSelectedFilter(option),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterOptions, selectedFilter, setSelectedFilter],
  );

  return (
    <div className="claims-page flex flex-col gap-4 w-full h-full max-w-[1256px] lg:max-h-[calc(100vh-96px-22px)]">
      <PageHeader />

      <div className="paper relative flex flex-col gap-6 overflow-y-auto py-8">
        <div className="absolute right-4 top-4 lg:right-8">
          <DropdownMenu
            renderLabel={() => <span>{sectionTitles[selectedFilter]}</span>}
            items={dropdownItems}
            labelClassName="w-fit px-4 gap-2 min-w-[130px] bg-[#385A66]"
          />
        </div>
        {sections.map(({ key, data }) => (
          <SaleSection
            key={key}
            title={sectionTitles[key]}
            sales={data}
            emptyText={`No ${sectionTitles[key].toLowerCase()} sales`}
          />
        ))}
      </div>
    </div>
  );
};

export default Claims;
