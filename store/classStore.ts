import { create } from "zustand";

interface SelectedClass {
  classId: string;
  className: string;
}
type ClassStoreType = {
  selectedClass: SelectedClass | null;
  setSelectedClass: (data: SelectedClass | null) => void;
};

export const useClassStore = create<ClassStoreType>((set) => ({
  selectedClass: null,
  setSelectedClass: (data) => set({ selectedClass: data }),
}));
