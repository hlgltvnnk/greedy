import React from 'react';
import classNames from 'classnames';

interface OpenPoolButtonProps {
  tokenId?: string;
  disabled?: boolean;
  className?: string;
}

const OpenPoolButton: React.FC<OpenPoolButtonProps> = ({
  tokenId,
  disabled = false,
  className,
}) => {
  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (tokenId) {
      window.open(
        `https://swap.pump.fun/?input=${tokenId}&output=So11111111111111111111111111111111111111112`,
        '_blank',
        'noopener noreferrer',
      );
    }
  };

  return (
    <button
      onClick={onClickHandler}
      disabled={disabled}
      className={classNames('open-pool-button', className)}>
      <span>Open Pool</span>
      <img src="/images/pool/pumpfun.png" alt="" className="w-8 h-8 min-w-8 min-h-8" />
    </button>
  );
};

export default OpenPoolButton;
