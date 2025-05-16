export enum EWalletType {
  Phantom = 'phantom',
  Solflare = 'solflare',
  Backpack = 'backpack',
  Magiceden = 'magiceden',
  Coinbase = 'coinbase',
  Walletconnect = 'walletconnect',
}

export function formatWalletAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
