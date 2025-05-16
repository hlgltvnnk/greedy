// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { PutOptions, Web3Storage } from 'web3.storage';
import { env } from '../config/env';

interface IService {
  uploadFile: (file: File[], options?: PutOptions) => Promise<string>;
}

export class IPFSService implements IService {
  _storage: Web3Storage | null = null;

  constructor(token: string) {
    this._storage = new Web3Storage({ token });
  }

  public async uploadFile(file: File[]): Promise<string> {
    try {
      const data = new FormData();
      data.append('file', file[0]);
      const response = await fetch('https://storage.hapilabs.one/upload.php', {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: data,
      });

      const json: { web3cid: string }[] = await response.json();

      return json[0].web3cid;
    } catch (error) {
      console.error(error);
      if (env.NETWORK === 'testnet') {
        return 'bafkreiefm34mkqcdawk7nj2k5wmbilkp4pgdqiyzg5jwrbnvdn5g5odz3e';
      } else throw error;
    }
  }
}

// export const ipfsService = new IPFSService(env.IPFS_TOKEN);
