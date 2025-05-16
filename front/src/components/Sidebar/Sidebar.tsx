import React from 'react';
import classNames from 'classnames';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAppStore } from '../../store/appStore';
import MyClaimsIcon from '../../assets/nav/claims.svg?react';
import DistributionsIcon from '../../assets/nav/distributions.svg?react';
import ProfileIcon from '../../assets/nav/profile.svg?react';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';
import { formatWalletAddress } from '../../utils/wallet';

interface SidebarLinkProps {
  to: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  isSidebarOpen: boolean;
  disabled?: boolean;
  soon?: boolean;
  activeMatch?: (pathname: string) => boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  label,
  isSidebarOpen,
  disabled = false,
  soon = false,
  activeMatch,
}) => {
  const location = useLocation();
  const isActive = activeMatch ? activeMatch(location.pathname) : location.pathname === to;

  return (
    <NavLink
      to={to}
      className={() =>
        classNames(
          'primary-button w-full flex items-center justify-start font-normal text-nowrap pr-2',
          isActive ? 'bg-primary text-white' : 'bg-transparent text-secondary-text shadow-none',
          disabled && 'cursor-not-allowed pointer-events-none',
        )
      }>
      <Icon
        className={classNames(
          'stroke-current min-w-[24px] min-h-[24px] mr-4',
          disabled && 'opacity-50',
        )}
      />
      <span
        className={classNames(
          'transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap',
          isSidebarOpen ? (disabled ? 'opacity-50' : 'opacity-100') : 'opacity-0',
        )}>
        {label}
      </span>
      {soon && (
        <span
          className={classNames(
            'w-fit inline-flex items-center justify-center text-[#8EAFBB] bg-[#96B9C533] ml-1 px-3 py-1 text-xs rounded-[20px] transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap font-secondary',
            isSidebarOpen ? 'opacity-100' : 'opacity-0',
          )}>
          Soon
        </span>
      )}
    </NavLink>
  );
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const showModal = useModalStore((state) => state.showModal);
  const { connected, publicKey: accountId, disconnect } = useWallet();
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);

  return (
    <div className={classNames('sidebar-app', { 'sidebar-app--open': isSidebarOpen })}>
      <div className="relative w-full flex flex-col items-center">
        <button
          className="absolute top-[34px] right-[-36px] secondary-button w-[40px] h-[40px] p-2 rounded-2xl flex items-center justify-center"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          <img
            src={isSidebarOpen ? '/images/arrow-left.png' : '/images/arrow-right.png'}
            className="w-[24px] h-[24px] min-w-[24px] min-h-[24px]"
            alt="toggle"
          />
        </button>

        <div className="flex flex-col items-center justify-center w-full gap-[44px] cursor-pointer">
          <div
            className="flex items-center justify-start w-full p-[6px] gap-[7px]"
            onClick={() => navigate('/')}>
            <img
              src="/images/logo.png"
              className="w-[46px] h-[46px] min-w-[46px] min-h-[46px]"
              alt="logo"
            />
            <img
              src="/images/logo-greedy.png"
              alt="greedy"
              className={classNames(
                'w-[124px] h-[26px] min-w-[124px] min-h-[26px] transition-all duration-200 ease-in-out',
                isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden',
              )}
            />
          </div>

          <nav className="flex flex-col items-center justify-center gap-4 w-full">
            <SidebarLink
              to="/"
              icon={DistributionsIcon}
              label="Greedy Sales"
              isSidebarOpen={isSidebarOpen}
              activeMatch={(pathname) => pathname === '/' || pathname.startsWith('/sale')}
            />
            <SidebarLink
              to="/claims"
              icon={MyClaimsIcon}
              label="My Claims"
              isSidebarOpen={isSidebarOpen}
              disabled={!connected}
            />
            <SidebarLink
              to="/profile"
              icon={ProfileIcon}
              label="Profile"
              isSidebarOpen={isSidebarOpen}
              disabled={!connected}
            />
          </nav>
        </div>

        {!connected ? (
          <button
            className={classNames(
              'secondary-button w-full justify-start flex-row gap-2 mt-auto bg-transparent shadow-none border-none font-primary text-lg font-normal text-nowrap text-secondary-text',
            )}
            onClick={() => {
              showModal(EModals.CONNECT_WALLET);
              setIsSidebarOpen(false);
            }}>
            <img
              src="/images/airdrop/wallet.png"
              alt="wallet"
              className="w-[24px] h-[24px] min-w-[24px] min-h-[24px]"
            />
            <span
              className={classNames(
                'transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap',
                isSidebarOpen ? 'opacity-100' : 'opacity-0',
              )}>
              Connect Wallet
            </span>
          </button>
        ) : (
          <button
            className={classNames(
              'secondary-button justify-start flex-row gap-2 p-0 w-full mt-auto bg-transparent shadow-none border-none font-primary text-base font-normal text-nowrap',
            )}
            onClick={() => setIsSidebarOpen(true)}>
            <img
              src="/images/greed-icon.png"
              alt=""
              className="w-[56px] h-[56px] min-w-[56px] min-h-[56px]"
            />
            <span
              className={classNames(
                'transition-all duration-200 ease-in-out overflow-hidden text-ellipsis whitespace-nowrap text-sm max-w-[125px]',
                isSidebarOpen ? 'opacity-100' : 'opacity-0',
              )}>
              {formatWalletAddress(accountId?.toBase58() ?? '')}
            </span>
            <img
              src="/images/logout.png"
              alt=""
              className={classNames(
                'w-[24px] h-[24px] min-w-[24px] min-h-[24px] transition-all duration-200 ease-in-out ml-auto',
                isSidebarOpen ? 'opacity-100' : 'opacity-0',
              )}
              onClick={() => disconnect()}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
