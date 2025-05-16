import { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'green' | 'red' | 'white';
  className?: string;
  type?: 'checkbox' | 'toggle';
  isChecked?: boolean;
  isCloseOnClick?: boolean;
}

interface DropdownMenuProps {
  renderLabel: () => React.ReactNode;
  items: DropdownItem[];
  className?: string;
  labelClassName?: string;
  menuClassName?: string;
  menuItemClassName?: string;
  showArrow?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  renderLabel,
  items,
  className = '',
  labelClassName = '',
  menuClassName = '',
  menuItemClassName = '',
  showArrow = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={classNames('relative', className)} ref={ref}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'secondary-button relative w-[190px] p-2 flex items-center justify-between z-2 text-sm/[100%] font-normal font-primary h-full',
          labelClassName,
        )}>
        {renderLabel()}
        {showArrow && (
          <img
            src="/images/arrow-dropdown.png"
            alt="arrow-dropdown"
            className="w-5 h-5 ml-auto"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={classNames(
            'absolute flex flex-col top-0 left-0 w-full bg-[#121D21] rounded-2xl shadow-lg z-1 pb-2 pt-[46px]',
            'border border-solid border-[#030201]',
            menuClassName,
          )}>
          {items.map(
            (
              {
                label,
                icon,
                onClick,
                color = 'default',
                className,
                type = 'default',
                isChecked,
                isCloseOnClick = true,
              },
              i,
            ) => (
              <div
                key={i}
                onClick={() => {
                  onClick();
                  if (type !== 'checkbox' && type !== 'toggle' && isCloseOnClick) {
                    setIsOpen(false);
                  }
                }}
                className={classNames(
                  'flex items-center justify-between gap-2 px-4 py-[10px] cursor-pointer transition-all',
                  'text-sm/[100%] font-normal font-primary',
                  {
                    'text-[#96B9C5] hover:text-white': color === 'default',
                    'text-white hover:opacity-80': color === 'white',
                    'text-success': color === 'green',
                    'text-fail': color === 'red',
                  },
                  menuItemClassName,
                  className,
                )}>
                {type === 'checkbox' && (
                  <input type="checkbox" checked={isChecked} onChange={() => {}} />
                )}
                {type === 'toggle' && <ToggleSwitch checked={!!isChecked} onChange={() => {}} />}
                <span>{label}</span>
                {icon}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};
