import React from 'react';

import twitterLogo from '/images/social/twitter.png';
import telegramLogo from '/images/social/telegram.png';
import { env } from '../../config/env';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener, noreferrer');
  };

  return (
    <footer className="footer-desktop w-full flex items-end justify-between h-[54px] flex-shrink-0 min-h-0">
      <p className="text-base/[140%] text-center font-normal font-secondary text-secondary-text">
        © Copyright {year} - Greedy. All Rights Reserved.
      </p>
      <div className="flex flex-row items-center justify-between gap-4">
        <img
          onClick={() => openLink(env.TWITTER_URL)}
          src={twitterLogo}
          alt="Twitter"
          className="w-[24px] h-[24px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
        />
        <img
          onClick={() => openLink(env.TELEGRAM_URL)}
          src={telegramLogo}
          alt="Telegram"
          className="w-[24px] h-[24px] cursor-pointer hover:opacity-80 transition-opacity duration-200"
        />
      </div>
    </footer>
  );
};

export default Footer;
