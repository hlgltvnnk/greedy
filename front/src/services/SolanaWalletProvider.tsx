import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { env } from '../config/env';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new WalletConnectWalletAdapter({
        network:
          env.NETWORK === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet,
        options: {
          projectId: env.WALLET_CONNECT_PROJECT_ID,
          relayUrl: 'wss://relay.walletconnect.com',
          metadata: {
            name: 'Greedy',
            description: 'Connect wallet to use Greedy',
            url: env.NETWORK === 'mainnet' ? 'https://greedy.bid' : 'https://stage.greedy.bid',
            icons: [
              env.NETWORK === 'mainnet'
                ? 'https://greedy.bid/images/logo-title.png'
                : 'https://stage.greedy.bid/images/logo-title.png',
            ],
          },
        },
      }),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={env.SOLANA_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
