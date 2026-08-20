import { create } from "zustand";

type StudentSelectionStoreType = {
  selectedIds: string[];
  toggleId: (id: string) => void;
  clearSelection: () => void;
  setSelectedIds: (ids: string[]) => void;
};

export const useStudentSelectionStore = create<StudentSelectionStoreType>(
  (set) => ({
    selectedIds: [],
    toggleId: (id: string) =>
      set((state) => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((sid) => sid !== id)
          : [...state.selectedIds, id],
      })),
    clearSelection: () => set({ selectedIds: [] }),
    setSelectedIds: (ids: string[]) => set({ selectedIds: ids }),
  }),
);
