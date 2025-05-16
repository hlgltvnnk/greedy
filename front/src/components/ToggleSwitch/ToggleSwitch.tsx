import classNames from 'classnames';
import { memo } from 'react';

interface IToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<IToggleSwitchProps> = ({
  checked,
  onChange,
  className = '',
  disabled = false,
}) => (
  <div
    onClick={onChange}
    className={classNames(
      'w-[46px] min-w-[46px] h-[24px] flex items-center rounded-full cursor-pointer px-[2px] transition-colors',
      checked ? 'bg-[#C24620]' : 'bg-[#1F3239]',
      disabled && 'opacity-40 pointer-events-none',
      className,
    )}>
    <div
      className={classNames(
        'w-[20px] h-[20px] rounded-full bg-white transition-transform',
        checked ? 'translate-x-[22px]' : 'translate-x-0',
      )}
    />
  </div>
);

export default memo(ToggleSwitch);
