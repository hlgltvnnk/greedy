import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { GreedySalesService } from '../services/contracts';
import { TokenMetadata } from '../interfaces/tokens';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

interface ITokensStore {
  tokensMetadata: Record<string, TokenMetadata>;
  getMetadata: (token: PublicKey) => TokenMetadata | undefined;
  fetchTokensMetadata: (tokens: PublicKey[]) => Promise<void>;
}

export const useTokensStore = create<ITokensStore>((set, get) => ({
  tokensMetadata: {},

  getMetadata: (token) => {
    const key = token.toBase58();
    return get().tokensMetadata[key];
  },

  fetchTokensMetadata: async (tokens: PublicKey[]) => {
    const current = { ...get().tokensMetadata };
    const newTokens = tokens.filter((t) => !current[t.toBase58()]);
    if (!newTokens.length) return;

    const metadataPDAs = newTokens.map(
      (mint) =>
        PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
          TOKEN_METADATA_PROGRAM_ID,
        )[0],
    );

    const accounts = await GreedySalesService.connection.getMultipleAccountsInfo(metadataPDAs);

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      const key = newTokens[i].toBase58();

      if (!account) continue;

      try {
        const buffer = account.data;

        const nameOffset = 1 + 32 + 32;
        const nameLen = buffer.readUInt32LE(nameOffset);
        const name = buffer
          .slice(nameOffset + 4, nameOffset + 4 + nameLen)
          .toString('utf8')
          .replace(/\0/g, '')
          .trim();

        const symOffset = nameOffset + 4 + nameLen;
        const symLen = buffer.readUInt32LE(symOffset);
        const symbol = buffer
          .slice(symOffset + 4, symOffset + 4 + symLen)
          .toString('utf8')
          .replace(/\0/g, '')
          .trim();

        const uriOffset = symOffset + 4 + symLen;
        const uriLen = buffer.readUInt32LE(uriOffset);
        const rawUri = buffer
          .slice(uriOffset + 4, uriOffset + 4 + uriLen)
          .toString('utf8')
          .replace(/\0/g, '')
          .trim();

        if (!rawUri || rawUri.includes('example.com')) {
          console.warn(`Skipping invalid URI for ${key}: ${rawUri}`);
          continue;
        }

        const uri = rawUri.startsWith('ipfs://')
          ? rawUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
          : rawUri;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let metaJson: Record<string, any> = {};
        let image = '';

        try {
          const res = await fetch(uri);
          if (res.ok) {
            metaJson = await res.json();
            image = metaJson.image || '';
            if (image.startsWith('ipfs://')) {
              image = image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            }
          } else {
            console.warn(`Metadata fetch failed (${res.status}) for ${key}: ${uri}`);
          }
        } catch (e) {
          console.warn(`Failed to fetch URI metadata for ${key}: ${uri}`, e);
        }

        current[key] = {
          name,
          symbol,
          uri: rawUri,
          image,
          ...metaJson,
        };
      } catch (err) {
        console.warn(`Failed to parse metadata for ${key}`, err);
      }
    }

    set({ tokensMetadata: current });
  },
}));
