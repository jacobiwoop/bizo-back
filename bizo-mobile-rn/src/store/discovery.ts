import { create } from "zustand";

type DiscoveryState = {
  searchQuery: string;
  searchCategory: string | null;
  filterSheetOpen: boolean;
  setSearchContext: (context: { query?: string; category?: string | null }) => void;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
};

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  searchQuery: "Macbook",
  searchCategory: null,
  filterSheetOpen: false,
  setSearchContext: ({ query, category }) =>
    set((state) => ({
      searchQuery: query ?? state.searchQuery,
      searchCategory: category === undefined ? state.searchCategory : category,
      filterSheetOpen: false,
    })),
  openFilterSheet: () => set({ filterSheetOpen: true }),
  closeFilterSheet: () => set({ filterSheetOpen: false }),
}));
