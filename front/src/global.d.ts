interface SolanaProvider {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: {
    toString(): string;
  };
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: 'connect' | 'disconnect' | 'accountChanged', handler: (...args: any[]) => void): void;
  request?(params: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

export {};
