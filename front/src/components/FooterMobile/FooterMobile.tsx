import React from 'react';
import classNames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';

import MyClaimsIcon from '../../assets/nav/claims.svg?react';
import DistributionsIcon from '../../assets/nav/distributions.svg?react';
import ProfileIcon from '../../assets/nav/profile.svg?react';
import { useWallet } from '@solana/wallet-adapter-react';

interface FooterLinkProps {
  to: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  disabled?: boolean;
  activeMatch?: (pathname: string) => boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({
  to,
  icon: Icon,
  label,
  disabled = false,
  activeMatch,
}) => {
  const location = useLocation();
  const isActive = activeMatch ? activeMatch(location.pathname) : location.pathname === to;

  return (
    <NavLink
      to={to}
      className={() =>
        classNames(
          'primary-button flex items-center justify-start gap-2 font-normal text-nowrap',
          isActive
            ? 'nav-active bg-primary text-white'
            : 'nav-incative bg-transparent text-secondary-text shadow-none',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )
      }>
      <Icon className="stroke-current min-w-[24px] min-h-[24px]" />
      <span
        className={classNames(
          'nav-label transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap',
        )}>
        {label}
      </span>
    </NavLink>
  );
};

const FooterMobile: React.FC = () => {
  const { connected } = useWallet();

  return (
    <footer className="footer-mobile w-full flex items-end justify-center h-[88px] flex-shrink-0 ">
      <div className="relative w-[390px] flex justify-between">
        <nav className="flex items-center justify-center gap-1 w-full">
          <FooterLink
            to="/"
            icon={DistributionsIcon}
            label="Sales"
            activeMatch={(pathname) => pathname === '/' || pathname.startsWith('/sale')}
          />
          <FooterLink to="/claims" icon={MyClaimsIcon} label="My Claims" disabled={!connected} />
          <FooterLink to="/profile" icon={ProfileIcon} label="Profile" disabled={!connected} />
        </nav>
      </div>
    </footer>
  );
};

export default FooterMobile;
