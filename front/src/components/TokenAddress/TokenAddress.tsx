import React, { useState } from 'react';
import { formatWalletAddress } from '../../utils/wallet';
import CheckMarkIcon from '../../assets/checkmark.svg?react';
import CopyIcon from '../../assets/copy.svg?react';

interface ITokenAddressProps {
  tokenAddress: string;
}

const TokenAddress: React.FC<ITokenAddressProps> = ({ tokenAddress }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(tokenAddress);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="flex flex-row items-center md:gap-2 gap-1 h-[33px] px-2 md:px-4 bg-[#B93709] rounded-2xl border border-solid border-[#030201]">
      <p className="text-white md:text-sm/[100%] text-xs/[100%] font-secondary font-normal">
        {formatWalletAddress(tokenAddress)}
      </p>
      <button onClick={handleCopy}>
        {copied ? (
          <CheckMarkIcon className="w-4 h-4 text-success" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default TokenAddress;
