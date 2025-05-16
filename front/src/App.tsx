import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import classNames from 'classnames';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { Claims, Distribution, Distributions, Profile, Terms } from './pages';
import { Footer, Sidebar, FooterMobile, Header } from './components';
import { useHideSidebar } from './hooks/useHideSidebar';
import { useAppStore } from './store/appStore';
import Loading from './components/Loading/Loading';
import { GreedySalesService } from './services/contracts';
import { useSaleStore } from './store/useSaleStore';
import { useTokensStore } from './store/useTokensStore';

const App: React.FC = () => {
  const { connected, publicKey, wallet } = useWallet();

  const sales = useSaleStore((s) => s.sales);
  const setIsLoading = useAppStore((s) => s.setIsLoading);
  const fetchSales = useSaleStore((s) => s.fetchSales);
  const fetchAllParticipants = useSaleStore((s) => s.fetchAllParticipants);
  const fetchTokensMetadata = useTokensStore((state) => state.fetchTokensMetadata);
  const clearParticipants = useSaleStore((s) => s.clearParticipants);

  useHideSidebar();

  useEffect(() => {
    const init = async () => {
      try {
        GreedySalesService.setWallet((wallet?.adapter as WalletAdapter) || {});

        setIsLoading(true);
        await fetchSales();
        if (publicKey) {
          await fetchAllParticipants(publicKey);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.adapter, publicKey]);

  useEffect(() => {
    if (!sales.size) return;

    const loadTokensMetadata = async () => {
      const mintAddresses = Array.from(sales.values()).map((sale) => sale.mint);
      await fetchTokensMetadata(mintAddresses);
    };

    loadTokensMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales.size]);

  useEffect(() => {
    if (!connected) {
      clearParticipants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  return (
    <>
      <Loading />
      <Header />
      <main className="relative flex flex-1 flex-row w-full gap-8">
        <Sidebar />
        <div
          className={classNames('w-full flex flex-col items-center ml-auto main-app ')}
          style={{ width: 'calc(100% - 80px - 32px)' }}>
          <Routes>
            <Route index element={<Distributions />} />
            <Route path="/sale/:id" element={<Distribution />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <FooterMobile />
    </>
  );
};

export default App;
