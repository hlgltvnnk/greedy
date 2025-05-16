import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PageHeader, ProfileStats, ProfileWallet } from '../../components';
import { useRedirectIfNotConnected } from '../../hooks/useRedirectIfNotConnected';
import { useSaleStore } from '../../store/useSaleStore';
import { getAirdropStatus } from '../../utils/airdrops';
import { EAirdropStatus } from '../../interfaces/airdrops';
import { EModals } from '../../interfaces/modals';
import useModalStore from '../../store/modals.store';
import { SaleSection } from '../../components';

const sectionTitles: Record<'ACTIVE' | 'UPCOMING' | 'COMPLETED', string> = {
  ACTIVE: 'Active',
  UPCOMING: 'Upcoming',
  COMPLETED: 'Completed',
};

const Profile: React.FC = () => {
  useRedirectIfNotConnected('/');

  const { publicKey, connected } = useWallet();
  const showModal = useModalStore((s) => s.showModal);
  const salesMap = useSaleStore((s) => s.sales);

  const userSales = useMemo(
    () =>
      publicKey
        ? Array.from(salesMap.values()).filter((sale) => sale.authority.equals(publicKey))
        : [],
    [salesMap, publicKey],
  );

  const sections = useMemo(
    () => [
      {
        key: 'ACTIVE',
        data: userSales.filter((sale) => {
          const status = getAirdropStatus(sale, new Date().getTime());
          return status === EAirdropStatus.LIVE;
        }),
      },
      {
        key: 'UPCOMING',
        data: userSales.filter((sale) => {
          const status = getAirdropStatus(sale, new Date().getTime());
          return status === EAirdropStatus.UPCOMING;
        }),
      },
      {
        key: 'COMPLETED',
        data: userSales.filter((sale) => {
          const status = getAirdropStatus(sale, new Date().getTime());
          return status === EAirdropStatus.COMPLETED || status === EAirdropStatus.FAILED;
        }),
      },
    ],
    [userSales],
  );

  return (
    <div className="profile-page flex flex-col gap-4 w-full h-full max-w-[1256px] lg:max-h-[calc(100vh-96px-22px)]">
      <PageHeader />

      <div className="flex flex-col gap-8 w-full lg:flex-row mb-4">
        <ProfileWallet />
        <ProfileStats />
      </div>
      <div className="paper flex flex-col gap-2 lg:overflow-y-auto">
        <div className="flex flex-row justify-between items-center flex-wrap gap-4">
          <h2 className="text-lg/[100%] font-semibold">Create Sales</h2>
          <button
            className="primary-button md:w-[225px] w-full"
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
        </div>
        {sections.map(({ key, data }) => (
          <SaleSection
            key={key}
            title={sectionTitles[key as 'ACTIVE' | 'UPCOMING' | 'COMPLETED']}
            sales={data}
            emptyText={`No ${sectionTitles[
              key as 'ACTIVE' | 'UPCOMING' | 'COMPLETED'
            ].toLowerCase()} sales`}
            showCreated={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;
