import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AirdropCardItem, PageHeader, SalesFilter } from '../../components';
import { ISale } from '../../interfaces/airdrops';
import { useAirdropsList } from './useAirdropsList';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';
import { SalesFilterOption, useAppStore } from '../../store/appStore';
import { DropdownMenu } from '../../components/DropdownMenu/DropdownMenu';

const sectionTitles: Record<SalesFilterOption, string> = {
  ALL: 'All Sales',
  LIVE: 'Live Sales',
  UPCOMING: 'Upcoming Sales',
  COMPLETED: 'Completed Sales',
};

const dropdownTitles: Record<SalesFilterOption, string> = {
  ALL: 'All Sales',
  LIVE: 'Live',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
};

const filterOptions: SalesFilterOption[] = ['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'];

const Distributions: React.FC = () => {
  const { connected } = useWallet();
  const showModal = useModalStore((state) => state.showModal);
  const { liveCards, upcomingCards, completedCards } = useAirdropsList();

  const selectedFilter = useAppStore((state) => state.selectedSalesFilter);
  const setSelectedFilter = useAppStore((state) => state.setSelectedSalesFilter);

  const sections = useMemo(() => {
    const all = [
      { key: 'LIVE' as SalesFilterOption, data: liveCards },
      { key: 'UPCOMING' as SalesFilterOption, data: upcomingCards },
      { key: 'COMPLETED' as SalesFilterOption, data: completedCards },
    ];
    if (selectedFilter === 'ALL') {
      return all;
    }
    return all.filter((sec) => sec.key === selectedFilter);
  }, [selectedFilter, liveCards, upcomingCards, completedCards]);

  const dropdownItems = useMemo(
    () =>
      filterOptions
        .filter((option) => option !== selectedFilter)
        .map((option) => ({
          label: dropdownTitles[option],
          onClick: () => setSelectedFilter(option),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterOptions, selectedFilter, setSelectedFilter],
  );

  return (
    <div className="distribution-page flex flex-col items-center justify-start w-full h-full gap-4 lg:max-h-[calc(100vh-96px-22px)]">
      <PageHeader />

      <div className="distribution-page-image mb-4">
        <div className="distribution-page-text">
          <h2 className="font-bold font-primary">Welcome to Greedy</h2>
          <p className="text-md[140%] font-secondary font-normal text-white">
            The most fun and fair token sale experience on Solana
          </p>
        </div>
      </div>

      <div className="distribution-page-text--mobile lg:hidden">
        <h2 className="font-bold font-primary">Welcome to Greedy</h2>
        <p className="text-md font-secondary font-normal text-white">
          Choose between a little now or a lot later — your greed, your rules.
        </p>
      </div>

      <div className="flex flex-col items-center justify-between w-full gap-4 md:flex-row">
        <button
          className="primary-button px-12 py-4 lg:w-[225px] w-full"
          onClick={() =>
            connected
              ? showModal(EModals.CREATE_SALE, {
                  showConnectWallet: () => showModal(EModals.CONNECT_WALLET),
                  showSuccess: (saleId) => showModal(EModals.CREATE_SALE_SUCCESS, { saleId }),
                })
              : showModal(EModals.CONNECT_WALLET)
          }>
          Create New
        </button>
        <div className="flex flex-row items-center justify-between w-fit gap-4 ml-auto">
          <DropdownMenu
            renderLabel={() => <span>{dropdownTitles[selectedFilter]}</span>}
            items={dropdownItems}
            labelClassName="w-fit px-4 gap-2 min-w-[130px] bg-[#385A66]"
          />
          <SalesFilter />
        </div>
      </div>

      <div className="paper flex-col items-start gap-4 lg:gap-8 overflow-y-visible lg:overflow-y-auto overflow-x-hidden">
        {sections.map(({ key, data }) => (
          <AirdropSection key={key} title={sectionTitles[key]} sales={data} />
        ))}
      </div>
    </div>
  );
};

const AirdropSection: React.FC<{ title: string; sales: ISale[] }> = ({ title, sales }) => (
  <div className="airdrop-section">
    <h2 className="text-md/[100%] font-semibold text-[#75A3B2]">{title}</h2>
    {sales.length > 0 ? (
      <div className="flex flex-col gap-2 w-full">
        {sales.map((sale) => (
          <AirdropCardItem key={sale.id} sale={sale} />
        ))}
      </div>
    ) : (
      <p className="no-items">No {title.toLowerCase()} yet</p>
    )}
  </div>
);

export default Distributions;
