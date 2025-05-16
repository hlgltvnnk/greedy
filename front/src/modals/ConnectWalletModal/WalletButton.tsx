import { memo } from 'react';
import classNames from 'classnames';

interface IWalletButtonProps {
  label: string;
  onClick?: () => void;
  soon?: boolean;
}

const WalletButton: React.FC<IWalletButtonProps> = ({ label, soon = false, onClick }) => (
  <div
    onClick={onClick}
    className={classNames(
      'w-full flex items-center gap-3 md:px-8 px-4 py-4 rounded-xl border border-[#030201]',
      soon
        ? 'opacity-50 cursor-not-allowed bg-[#1A2528]'
        : 'cursor-pointer bg-[#0F181B] hover:opacity-80 transition-opacity duration-300 ease-in-out',
    )}>
    <img
      src={`/images/wallets/${label.toLowerCase().replace(/\s/g, '-')}.png`}
      className="w-8 h-8 min-w-8 min-h-8"
      alt={label}
    />
    <span className="">{label}</span>
    {soon && (
      <span className="text-xs rounded-[20px] px-3 py-1 bg-[#96B9C533] text-[#8EAFBB] font-secondary">
        Soon
      </span>
    )}
  </div>
);

export default memo(WalletButton);
