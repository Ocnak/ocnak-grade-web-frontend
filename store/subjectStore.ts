import { create } from "zustand";

type SubjectStoreType = {
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string) => void;
};

export const useSubjectStore = create<SubjectStoreType>((set) => ({
  selectedSubjectId: null,
  setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),
}));
