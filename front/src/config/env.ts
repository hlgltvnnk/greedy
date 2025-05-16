type EnvConfig = {
  NETWORK: 'testnet' | 'mainnet';

  CONTRACT_ID: string;
  WALLET_CONNECT_PROJECT_ID: string;

  TELEGRAM_URL: string;
  TWITTER_URL: string;

  SOLANA_URL: string;

  PINATA_URL: string;
  PINATA_API_KEY: string;
  PINATA_API_SECRET: string;
};

export const env: EnvConfig = {
  NETWORK: import.meta.env.VITE_NETWORK as 'testnet' | 'mainnet',

  CONTRACT_ID: import.meta.env.VITE_CONTRACT_ID,
  WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,

  TELEGRAM_URL: import.meta.env.VITE_TELEGRAM_URL,
  TWITTER_URL: import.meta.env.VITE_TWITTER_URL,

  SOLANA_URL: import.meta.env.VITE_SOLANA_URL,

  PINATA_URL: import.meta.env.VITE_PINATA_URL,
  PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY,
  PINATA_API_SECRET: import.meta.env.VITE_PINATA_API_KEY_SECRET,
};
