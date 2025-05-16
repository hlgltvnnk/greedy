import { memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletDropdown from '../WalletDropdown/WalletDropdown';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';

interface IPageHeaderProps {
  handleBack?: () => void;
}

const PageHeader: React.FC<IPageHeaderProps> = ({ handleBack }) => {
  const { connected } = useWallet();
  const showModal = useModalStore((s) => s.showModal);

  const location = useLocation();
  const isClaims = location.pathname.includes('/claims');
  const isProfile = location.pathname.includes('/profile');
  const isTerms = location.pathname.includes('/terms');

  const title = useMemo(() => {
    if (isClaims) return 'My Claims';
    if (isProfile) return 'Profile';
    if (isTerms) return 'Terms and Conditions';
    return 'Greedy Sales';
  }, [isClaims, isProfile, isTerms]);

  return (
    <div className="flex flex-col gap-4 items-start justify-between w-full lg:h-12 lg:flex-row min-w-[282px]">
      <h2
        className={classNames(
          'flex flex-row gap-1 text-xl font-primary font-semibold',
          handleBack ? 'cursor-pointer ml-0' : 'ml-4',
        )}
        onClick={handleBack}>
        {handleBack && (
          <img className="w-6 h-6 min-w-6 min-h-6 mt-0.5" src="/images/arrow-left.png" alt="<" />
        )}
        {title}
      </h2>
      <div className="flex items-center justify-between gap-2 md:gap-4 h-12 w-full lg:w-auto lg:justify-center ">
        <button
          onClick={() => showModal(EModals.HOW_IT_WORKS)}
          className="secondary-button box-border sm:gap-2 gap-1 font-primary sm:px-6 py-2 px-2 h-full min-w-[110px]">
          <img src="/images/faq.png" className="w-[24px] h-[24px] min-w-[24px] min-h-[24px]" />
          <span className="text-xs sm:text-sm">How it works</span>
        </button>
        {!connected ? (
          <button
            className="secondary-light-button box-border gap-2 sm:px-6 py-2 px-2 h-full lg:w-auto "
            onClick={() => showModal(EModals.CONNECT_WALLET)}>
            <img
              src="/images/airdrop/wallet-black.png"
              alt="wallet"
              className="w-[24px] h-[24px] min-w-[24px] min-h-[24px]"
            />
            <span>Connect Wallet</span>
          </button>
        ) : (
          <WalletDropdown />
        )}
      </div>
    </div>
  );
};

export default memo(PageHeader);
