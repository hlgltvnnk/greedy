import { Connection, PublicKey, RpcResponseAndContext, SignatureResult } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, BN, setProvider } from '@coral-xyz/anchor';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import {
  IRawParticipantAccount,
  IRawSaleAccount,
  ISaleAccount,
  ISaleStatsAccount,
} from '../../utils/parsers';
import { TokenMetadata } from '../../interfaces/tokens';
import { getIntlFormattedNumber } from '../../utils/core';
import { GreedySolana } from '../../config/contracts/greedy_solana';
import idlJson from '../../config/contracts/greedy_solana.json';
import { delay } from '../../utils/date';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export class SalesContractService {
  public connection: Connection;
  private _wallet?: Wallet;
  private _provider?: AnchorProvider;
  private _program?: Program<GreedySolana>;

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  setWallet(wallet: WalletAdapter) {
    this._wallet = wallet as unknown as Wallet;
    this._provider = new AnchorProvider(this.connection, wallet as unknown as Wallet, {
      preflightCommitment: 'confirmed',
    });
    setProvider(this._provider);
    this._program = new Program(idlJson as GreedySolana, this._provider);
  }

  get wallet() {
    if (!this._wallet) throw new Error('Wallet not set');
    return this._wallet;
  }

  get provider() {
    if (!this._provider) throw new Error('Provider not initialized');
    return this._provider;
  }

  get program() {
    if (!this._program) throw new Error('Program not initialized');
    return this._program;
  }

  async confirmTx(signature: string): Promise<RpcResponseAndContext<SignatureResult>> {
    const latestBlockhash = await this.connection.getLatestBlockhash('confirmed');

    return await this.connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      'confirmed',
    );
  }

  findParticipantAddress(saleId: BN, sender: PublicKey): PublicKey {
    const [participantPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('participant'), saleId.toArrayLike(Buffer, 'le', 16), sender.toBuffer()],
      this.program.programId,
    );
    return participantPda;
  }

  async createSale(
    saleId: BN,
    args: {
      metadata: {
        name: string;
        symbol: string;
        uri: string;
      };
      unlockWithAdmin: boolean;
      name: number[];
      description: number[];
      startDate: BN;
      endDate: BN;
      unlockRange: number[];
      targetDeposit: number;
    },
    authority: PublicKey,
  ) {
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sale'), saleId.toArrayLike(Buffer, 'le', 16)],
      this.program.programId,
    );

    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sale_mint'), saleId.toArrayLike(Buffer, 'le', 16)],
      this.program.programId,
    );

    return await this.program.methods
      .createSale(saleId, args)
      .accounts({
        authority,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sale: salePda,
        mint: mintPda,
      })
      .rpc();
  }

  async updateSale(
    saleId: BN,
    args: {
      targetDeposit: BN;
      name: number[];
      description: number[];
      endDate: BN;
      unlockRange: [number, number];
    },
    authority: PublicKey,
  ) {
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sale'), saleId.toArrayLike(Buffer, 'le', 16)],
      this.program.programId,
    );

    return await this.program.methods
      .updateSale(
        saleId,
        args.targetDeposit,
        args.description,
        args.name,
        args.endDate,
        args.unlockRange,
      )
      .accounts({
        authority,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sale: salePda,
      })
      .rpc();
  }

  async participate(
    saleId: BN,
    hours: number,
    amount: number,
    authority: PublicKey,
  ): Promise<string> {
    return await this.program.methods
      .participateInSale(saleId, amount, hours)
      .accounts({ sender: authority })
      .rpc();
  }

  async claim(saleId: BN, authority: PublicKey): Promise<string> {
    const txSig = await this.program.methods
      .claimSaleReward(saleId)
      .accounts({ sender: authority })
      .rpc();

    return txSig;
  }

  async recharge(saleId: BN, authority: PublicKey): Promise<string> {
    return await this.program.methods
      .recharge(saleId)
      .accounts({
        sender: authority,
      })
      .rpc();
  }

  async getSaleIds(): Promise<BN[]> {
    const sales = await this.program.account.sale.all();
    return sales.map((sale) => sale.account.id);
  }

  async getSales(): Promise<(IRawSaleAccount & { stats: ISaleStatsAccount })[]> {
    const sales = await this.program.account.sale.all();

    const saleStatsPDAs = sales.map(
      (sale) =>
        PublicKey.findProgramAddressSync(
          [Buffer.from('sale_stats'), sale.account.id.toArrayLike(Buffer, 'le', 16)],
          this.program.programId,
        )[0],
    );

    const statsAccounts = await this.program.account.saleStats.fetchMultiple(saleStatsPDAs);

    const results: (IRawSaleAccount & { stats: ISaleStatsAccount })[] = sales.map((sale, i) => {
      const stats = statsAccounts[i];

      return {
        ...sale,
        stats: stats ?? { version: 0, id: new BN(0), participationCount: new BN(0), stats: [] },
      };
    });

    return results;
  }

  async getSale(saleId: BN): Promise<{ sale: ISaleAccount; stats: ISaleStatsAccount }> {
    const [salePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sale'), saleId.toArrayLike(Buffer, 'le', 16)],
      this.program.programId,
    );
    const [saleStatsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('sale_stats'), saleId.toArrayLike(Buffer, 'le', 16)],
      this.program.programId,
    );

    const sale = await this.program.account.sale.fetch(salePda);
    const saleStats = await this.program.account.saleStats.fetch(saleStatsPda);

    return { sale, stats: saleStats };
  }

  async getParticipant(saleId: BN, authority: PublicKey) {
    const participantPda = this.findParticipantAddress(saleId, authority);
    const participant = await this.program.account.participant.fetch(participantPda);

    return participant;
  }

  async getAllParticipantsByUser(
    user: PublicKey,
  ): Promise<{ saleId: BN; participant: IRawParticipantAccount }[]> {
    const sales = await this.getSaleIds();
    delay(1000);
    const pdaToSaleMap = new Map<string, BN>();
    const participantPDAs = sales.map((saleId) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('participant'), saleId.toArrayLike(Buffer, 'le', 16), user.toBuffer()],
        this.program.programId,
      );
      pdaToSaleMap.set(pda.toBase58(), saleId);
      return pda;
    });

    const rawParticipants = await this.program.account.participant.fetchMultiple(participantPDAs);

    const result: { saleId: BN; participant: IRawParticipantAccount }[] = [];

    rawParticipants.forEach((acc, idx) => {
      if (acc) {
        const pda = participantPDAs[idx].toBase58();
        const saleId = pdaToSaleMap.get(pda);
        if (saleId) {
          result.push({ saleId, participant: acc });
        }
      }
    });

    return result;
  }

  async getTokenMetadata(mint: PublicKey): Promise<TokenMetadata> {
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const info = await this.connection.getAccountInfo(metadataPda);
    if (!info) return { name: '', symbol: '', uri: '', image: '' };

    const buffer = info.data;

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

    if (!rawUri || !/^https?:\/\/|ipfs:\/\//.test(rawUri)) {
      return { name, symbol, uri: rawUri, image: '' };
    }

    const uri = rawUri.startsWith('ipfs://')
      ? rawUri.replace('ipfs://', 'https://ipfs.io/ipfs/')
      : rawUri;

    try {
      const metaRes = await fetch(uri);
      if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status}`);
      const metaJson = await metaRes.json();

      let image = metaJson.image || '';
      if (image.startsWith('ipfs://')) {
        image = image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      }

      return { name, symbol, uri: rawUri, image, ...metaJson };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // console.error('Error fetching token metadata:', e);
      return { name, symbol, uri: rawUri, image: '' };
    }
  }

  async getSolBalance(publicKey: PublicKey): Promise<{ amount: number; formattedAmount: string }> {
    const lamports = await this.connection.getBalance(publicKey);
    const sol = lamports / 1_000_000_000;
    const flooredSol = Math.floor(sol * 100) / 100;

    return {
      amount: lamports,
      formattedAmount: getIntlFormattedNumber(flooredSol),
    };
  }
}
