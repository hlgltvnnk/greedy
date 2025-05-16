import React from 'react';
import classNames from 'classnames';
import useModalStore from '../../store/modals.store';
import { EModals } from '../../interfaces/modals';
import { useWallet } from '@solana/wallet-adapter-react';

const Header: React.FC = () => {
  const { connected, publicKey: accountId, disconnect } = useWallet();
  const showModal = useModalStore((state) => state.showModal);

  return (
    <header className="header w-full flex justify-between items-center h-[40px] mt-4">
      <div className="flex items-center justify-start p-[6px] gap-[7px]">
        <img
          src="/images/logo.png"
          className="w-[40px] h-[40px] min-w-[40px] min-h-[40px]"
          alt="logo"
        />
        <img
          src="/images/logo-greedy.png"
          alt="greedy"
          className={classNames(
            'w-[88px] h-[20px] min-w-[88px] min-h-[20px] transition-all duration-200 ease-in-out',
          )}
        />
      </div>

      {!connected ? (
        <button
          className={classNames(
            'secondary-button justify-start flex-row gap-2 bg-transparent shadow-none border-none font-primary text-lg font-normal text-nowrap text-secondary-text',
          )}
          onClick={() => showModal(EModals.CONNECT_WALLET)}>
          <img
            src="/images/airdrop/wallet.png"
            alt="wallet"
            className="w-[24px] h-[24px] min-w-[24px] min-h-[24px]"
          />
          <span className={classNames('overflow-hidden whitespace-nowrap')}>Connect</span>
        </button>
      ) : (
        <button
          className={classNames(
            'secondary-button justify-start flex-row sm:gap-2 gap-1 p-0 bg-transparent shadow-none border-none font-primary text-base font-normal text-nowrap',
          )}
          onClick={() => undefined}>
          <img
            src="/images/greed-icon.png"
            alt=""
            className="w-[40px] h-[40px] min-w-[40px] min-h-[40px]"
          />
          <span
            className={classNames(
              'transition-all duration-200 ease-in-out overflow-hidden text-ellipsis whitespace-nowrap max-w-[80px] sm:max-w-[150px]',
            )}>
            {accountId?.toBase58()}
          </span>
          <img
            src="/images/logout.png"
            alt=""
            className={classNames('w-[24px] h-[24px] min-w-[24px] min-h-[24px] opacity-100')}
            onClick={() => disconnect()}
          />
        </button>
      )}
    </header>
  );
};

export default Header;
