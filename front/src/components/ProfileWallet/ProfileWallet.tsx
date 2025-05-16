import { FC, memo, useState } from 'react';
import classNames from 'classnames';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatWalletAddress } from '../../utils/wallet';
import CopyIcon from '../../assets/copy.svg?react';
import CheckMarkIcon from '../../assets/checkmark.svg?react';
import ShareIcon from '../../assets/share.svg?react';

const ProfileWallet: FC = () => {
  const [copied, setCopied] = useState(false);
  const { wallet, publicKey, disconnect } = useWallet();

  const walletName = wallet?.adapter.name.toLowerCase();
  const walletAddress = publicKey?.toBase58();

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  const solScanLinkClick = () => {
    window.open(`https://solscan.io/address/${walletAddress}`, '_blank');
  };

  return (
    <div className="paper bg-[#1D2F34] flex flex-col gap-6 lg:max-w-[440px] min-w-[305px]">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg/[100%] font-semibold">Your Wallet</h2>
        <div className="flex flex-row items-center gap-2">
          <div
            className={classNames(
              'secondary-button w-fit relative p-0 bg-transparent shadow-none border-none',
            )}>
            <img
              src="/images/greed-icon.png"
              alt=""
              className="w-[56px] h-[56px] min-w-[56px] min-h-[56px]"
            />
            <img
              src={`/images/wallets/${walletName}.png`}
              alt=""
              className="w-4 h-4 min-w-4 min-h-4 rounded-full absolute bottom-1 right-0 bg-[#582A09] shadow-[0_4px_0_0_#030201]"
            />
          </div>
          <span
            className={classNames(
              'flex flex-row items-center justify-center gap-2 text-sm/[100%] font-normal p-2 bg-[#385A66] rounded-[8px] w-[153px]',
              copied ? 'text-success' : 'text-white',
            )}>
            <span className="hidden sm:block">{formatWalletAddress(walletAddress || '', 4)}</span>
            <span className="block sm:hidden">{formatWalletAddress(walletAddress || '', 3)}</span>
            {copied ? (
              <CheckMarkIcon className="w-4 h-4 min-w-4 min-h-4 text-success" />
            ) : (
              <CopyIcon
                onClick={handleCopy}
                className="w-4 h-4 min-w-4 min-h-4 text-[#5E93A6] cursor-pointer"
              />
            )}
          </span>
          <div className="flex flex-row gap-2 w-full">
            <ShareIcon
              onClick={solScanLinkClick}
              className="w-6 h-6 min-w-6 min-h-6 text-white font-medium cursor-pointer"
            />
            <button
              className="text-fail text-sm/[100%] ml-auto font-secondary"
              onClick={disconnect}>
              <span className="hidden sm:block">Disconnect</span>
              <img
                src="/images/logout.png"
                alt=""
                className={classNames(
                  'w-[24px] h-[24px] min-w-[24px] min-h-[24px] opacity-100 sm:hidden',
                )}
                onClick={() => disconnect()}
              />
            </button>
          </div>
        </div>
      </div>
      <button
        className="secondary-light-button gap-2 text-black-text text-lg/[100%] font-normal pointer-events-none"
        disabled>
        Edit Profile
        <span className="bg-[#578C9D] rounded-full px-2 py-1 text-white text-xs font-semibold font-secondary">
          Soon
        </span>
      </button>
    </div>
  );
};

export default memo(ProfileWallet);
