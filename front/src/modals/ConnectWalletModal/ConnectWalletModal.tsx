import React, { useEffect, useState } from 'react';
import WalletButton from './WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { EWalletType } from '../../utils/wallet';
import { toast } from 'react-toastify';

const isAndroid = /Android/i.test(navigator.userAgent);
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isPhantomApp = /Phantom/.test(navigator.userAgent);

interface ConnectWalletModalProps {
  closeModal: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ closeModal }) => {
  const { select, connect, wallet } = useWallet();
  const [selectedWalletType, setSelectedWalletType] = useState<EWalletType | null>(null);

  const walletNameMap = {
    [EWalletType.Phantom]: 'Phantom',
    [EWalletType.Solflare]: 'Solflare',
    [EWalletType.Backpack]: 'Backpack',
    [EWalletType.Magiceden]: 'MagicEden',
    [EWalletType.Coinbase]: 'Coinbase',
    [EWalletType.Walletconnect]: 'WalletConnect',
  };

  const onConnectWallet = (walletType: EWalletType) => {
    const walletName = walletNameMap[walletType];

    if (walletType === EWalletType.Phantom && isAndroid) {
      toast.error('Please use Phantom in WalletConnect');
      return;
    }

    if (walletType === EWalletType.Walletconnect && isPhantomApp) {
      toast.error('WalletConnect is not supported in Phantom browser. Use direct Phantom instead.');
      return;
    }

    setSelectedWalletType(walletType);
    select(walletName as WalletName);
  };

  useEffect(() => {
    const connectIfReady = async () => {
      if (!selectedWalletType) return;
      const expectedName = walletNameMap[selectedWalletType];
      if (wallet?.adapter?.name === expectedName) {
        try {
          await connect();
          closeModal();
        } catch (err) {
          console.error('Помилка підключення:', err);
        } finally {
          setSelectedWalletType(null);
        }
      }
    };

    connectIfReady();
  }, [wallet, selectedWalletType]);

  return (
    <div className="modal w-full items-start lg:max-w-[920px] max-w-[90%] max-h-[90%] lg:p-8 p-6 flex flex-row gap-6 overflow-y-auto">
      <button
        onClick={closeModal}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
        <img src="/images/close.png" alt="close" className="w-6 h-6 min-w-6 min-h-6" />
      </button>

      <div className="w-full lg:max-w-[385px]">
        <h2 className="text-white text-4xl font-semibold mb-2">Connect Wallet</h2>
        <p className="text-[#B7CFD7] font-normal font-secondary md:mb-8 mb-6">
          Connect your crypto wallet to start using the app.
        </p>

        <div className="space-y-3 w-full">
          <WalletButton label="Phantom" onClick={() => onConnectWallet(EWalletType.Phantom)} />
          {!isMobile && (
            <WalletButton label="Solflare" onClick={() => onConnectWallet(EWalletType.Solflare)} />
          )}
          <WalletButton label="Backpack" soon />
          <WalletButton label="Magic Eden" soon />
          <WalletButton label="Coinbase Wallet" soon />
          <WalletButton
            label="WalletConnect"
            soon={isAndroid ? isPhantomApp : true}
            onClick={() => onConnectWallet(EWalletType.Walletconnect)}
          />
        </div>
      </div>

      <img
        src="/images/connect-img.png"
        alt="Gnome"
        className="hidden lg:block w-[371px] h-[512px] mr-8 my-auto object-contain"
      />
    </div>
  );
};

export default ConnectWalletModal;
