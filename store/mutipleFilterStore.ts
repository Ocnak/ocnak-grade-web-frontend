import { create } from "zustand";

interface MutipleFilterStoreType {
  selectedClassIds: string[];
  toggleClass: (classId: string) => void;
  removeClass: (classId: string) => void;
  clearClasses: () => void;
}

export const useMutipleFilterStore = create<MutipleFilterStoreType>((set) => ({
  selectedClassIds: [],
  toggleClass: (classId) =>
    set((state) => ({
      selectedClassIds: state.selectedClassIds.includes(classId)
        ? state.selectedClassIds.filter((id) => id !== classId)
        : [...state.selectedClassIds, classId],
    })),
  removeClass: (classId) =>
    set((state) => ({
      selectedClassIds: state.selectedClassIds.filter((id) => id !== classId),
    })),
  clearClasses: () => set({ selectedClassIds: [] }),
}));
