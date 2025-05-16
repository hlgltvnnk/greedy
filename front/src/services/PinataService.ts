import axios from 'axios';
import { env } from '../config/env';

export async function uploadFileToPinata(file: File) {
  const url = env.PINATA_URL;
  const data = new FormData();
  data.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: 'MyApp',
    },
  });
  data.append('pinataMetadata', metadata);

  const response = await axios.post(url, data, {
    maxBodyLength: Infinity,
    headers: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'Content-Type': `multipart/form-data; boundary=${(data as any)._boundary}`,
      pinata_api_key: env.PINATA_API_KEY,
      pinata_secret_api_key: env.PINATA_API_SECRET,
    },
  });

  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
}
