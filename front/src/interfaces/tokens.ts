export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  image?: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
