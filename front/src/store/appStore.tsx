import { create } from 'zustand';

export type MyClaimsFilterOption = 'ALL' | 'PENDING' | 'CLAIMABLE' | 'CLAIMED' | 'FAILED';
export type SalesFilterOption = 'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED';

interface IAppStore {
  isSidebarOpen: boolean;
  isLoading: boolean;
  selectedSalesFilter: SalesFilterOption;
  selectedClaimFilter: MyClaimsFilterOption;
  showCreatedSales: boolean;
  showParticipatedSales: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedSalesFilter: (filter: SalesFilterOption) => void;
  setSelectedClaimFilter: (filter: MyClaimsFilterOption) => void;
  toggleShowCreatedSales: () => void;
  toggleShowParticipatedSales: () => void;
}

export const useAppStore = create<IAppStore>((set) => ({
  isSidebarOpen: false,
  isLoading: true,
  selectedClaimFilter: 'ALL',
  selectedSalesFilter: 'ALL',
  showCreatedSales: false,
  showParticipatedSales: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedSalesFilter: (filter) => set({ selectedSalesFilter: filter }),
  setSelectedClaimFilter: (filter) => set({ selectedClaimFilter: filter }),
  toggleShowCreatedSales: () => set((state) => ({ showCreatedSales: !state.showCreatedSales })),
  toggleShowParticipatedSales: () =>
    set((state) => ({ showParticipatedSales: !state.showParticipatedSales })),
}));
