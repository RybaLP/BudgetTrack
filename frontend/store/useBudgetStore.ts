import { create } from 'zustand';

interface BudgetState {
  filterCategory: string;
  filterFrom: string;
  filterTo: string;
  isTransactionModalOpen: boolean;
  
  setFilterCategory: (category: string) => void;
  setFilterFrom: (from: string) => void;
  setFilterTo: (to: string) => void;
  setTransactionModalOpen: (open: boolean) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  filterCategory: '',
  filterFrom: '',
  filterTo: '',
  isTransactionModalOpen: false,

  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterFrom: (from) => set({ filterFrom: from }),
  setFilterTo: (to) => set({ filterTo: to }),
  setTransactionModalOpen: (open) => set({ isTransactionModalOpen: open }),
}));