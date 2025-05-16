import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AirdropInfo, PageHeader, AirdropHeatMap, AirdropGreed } from '../../components';
import { useAppStore } from '../../store/appStore';
import { showToast } from '../../utils/toast';
import { useAirdropPolling } from '../../hooks/useAirdropPolling';
import { useSaleStore } from '../../store/useSaleStore';
import { getAirdropStatus } from '../../utils/airdrops';
import { EAirdropStatus } from '../../interfaces/airdrops';
import AirdropFailed from '../../components/AirdropFailed/AirdropFailed';
import { useNowMs } from '../../hooks/useNowMs';

const Distribution: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const isLoading = useAppStore((state) => state.isLoading);
  const saleId = decodeURIComponent(params.id as string);
  const sale = useSaleStore((s) => s.sales.get(saleId));
  const now = useNowMs(5_000);

  const handleBack = () => navigate('/');

  useEffect(() => {
    if (!sale && !isLoading) {
      navigate('/');
      showToast('error', 'Cannot find sale');
    }
  }, [sale, isLoading, navigate]);

  useAirdropPolling(saleId);

  if (!sale) return null;

  const status = getAirdropStatus(sale, now);
  const isFailed = status === EAirdropStatus.FAILED;

  return (
    <div className="flex flex-1 flex-col w-full gap-4 lg:max-w-[1256px]">
      <PageHeader handleBack={handleBack} />
      <div className="flex flex-row items-start justify-center w-full lg:gap-8 gap-4 h-full xl:flex-nowrap flex-wrap">
        <div className="flex flex-col h-fit xl:h-full lg:gap-8 gap-4 w-full lg:min-w-[700px] min-w-[282px]">
          <AirdropInfo sale={sale} />
          <AirdropHeatMap sale={sale} className="paper" />
        </div>
        {isFailed ? <AirdropFailed sale={sale} /> : <AirdropGreed sale={sale} />}
      </div>
    </div>
  );
};

export default Distribution;
