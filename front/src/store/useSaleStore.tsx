import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { IParticipant, ISale } from '../interfaces/airdrops';
import { GreedySalesService } from '../services/contracts';
import { parseParticipant, parseSaleAccount } from '../utils/parsers';
import { uuidToBn } from '../utils/core';

interface SaleStore {
  sales: Map<string, ISale>;
  setSales: (sales: ISale[]) => void;
  getSale: (id: string) => ISale | undefined;

  participants: Map<string, IParticipant>;
  setParticipants: (participants: IParticipant[]) => void;

  fetchSales: () => Promise<void>;
  fetchSale: (id: string) => Promise<void>;

  fetchParticipant: (saleId: string, user: PublicKey) => Promise<void>;
  fetchAllParticipants: (user: PublicKey) => Promise<void>;

  clearParticipants: () => void;
}

export const useSaleStore = create<SaleStore>((set, get) => ({
  sales: new Map(),
  setSales: (sales: ISale[]) => {
    set({ sales: new Map(sales.map((sale) => [sale.id, sale])) });
  },
  getSale: (id: string) => get().sales.get(id),

  participants: new Map(),
  setParticipants: (participants: IParticipant[]) => {
    set({ participants: new Map(participants.map((p) => [p.saleId, p])) });
  },

  fetchSales: async () => {
    const sales = await GreedySalesService.getSales();

    const parsedSales = sales.map((sale) =>
      parseSaleAccount(sale.account, sale.stats, sale.publicKey),
    );

    const filteredSales = parsedSales.filter((sale) => sale !== null);
    set({ sales: new Map(filteredSales.map((sale) => [sale.id, sale])) });
  },
  fetchSale: async (id: string) => {
    const { sale, stats } = await GreedySalesService.getSale(uuidToBn(id));
    const parsedSale = parseSaleAccount(sale, stats);
    if (parsedSale) {
      set((state) => {
        const updatedSales = new Map(state.sales);
        updatedSales.set(parsedSale.id, parsedSale);
        return { sales: updatedSales };
      });
    }
  },

  fetchParticipant: async (saleId: string, user: PublicKey) => {
    try {
      const participantRaw = await GreedySalesService.getParticipant(uuidToBn(saleId), user);
      const participant = parseParticipant(participantRaw);

      set((state) => {
        const updatedParticipants = new Map(state.participants);
        updatedParticipants.set(participant.saleId, participant);
        return { participants: updatedParticipants };
      });
    } catch (e) {
      console.warn(`No participant found for saleId=${saleId} and user=${user.toBase58()}`, e);
    }
  },

  fetchAllParticipants: async (user: PublicKey) => {
    const participants = await GreedySalesService.getAllParticipantsByUser(user);
    const participantsFormatted = participants.map(({ participant }) =>
      parseParticipant(participant),
    );
    const validParticipants = participantsFormatted.filter((p): p is IParticipant => p !== null);
    set({ participants: new Map(validParticipants.map((p) => [p.saleId, p])) });
  },

  clearParticipants: () => set({ participants: new Map() }),
}));
