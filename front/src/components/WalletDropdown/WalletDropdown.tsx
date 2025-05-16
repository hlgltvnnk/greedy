import { useNavigate } from 'react-router-dom';
import { memo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatWalletAddress } from '../../utils/wallet';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import CopyIcon from '../../assets/copy.svg?react';
import CheckMarkIcon from '../../assets/checkmark.svg?react';
import DisconnectIcon from '../../assets/leave.svg?react';
import ProfileIcon from '../../assets/user.svg?react';

const WalletDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, wallet, disconnect } = useWallet();
  const accountId = publicKey?.toBase58();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (accountId) {
      navigator.clipboard.writeText(accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const walletIcon = wallet
    ? `/images/wallets/${wallet.adapter.name.toLowerCase()}.png`
    : '/images/wallets/phantom.png';

  return (
    <DropdownMenu
      className="h-full"
      labelClassName="font-primary z-4"
      menuClassName="z-3 bg-[#030201] border border-solid border-[#030201] pt-[58px] gap-2"
      renderLabel={() => (
        <div className="flex items-center gap-2">
          <img src={walletIcon} alt="wallet" className="w-8 h-8" />
          <span className="font-medium">{formatWalletAddress(accountId || '')}</span>
        </div>
      )}
      items={[
        {
          label: copied ? 'Copied' : 'Copy Address',
          icon: copied ? <CheckMarkIcon className="w-6 h-6" /> : <CopyIcon className="w-6 h-6" />,
          onClick: handleCopy,
          color: copied ? 'green' : 'white',
          isCloseOnClick: false,
        },
        {
          label: 'My Profile',
          icon: <ProfileIcon className="w-6 h-6" />,
          onClick: () => navigate('/profile'),
          color: 'white',
        },
        {
          label: 'Disconnect',
          icon: <DisconnectIcon className="w-6 h-6" />,
          onClick: () => disconnect(),
          color: 'red',
          className: 'mt-6',
        },
      ]}
    />
  );
};

export default memo(WalletDropdown);
