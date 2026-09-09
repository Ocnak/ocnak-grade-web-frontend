import { create } from "zustand";

type FilterStoreType = {
  name: string;
  className: string;
  location: string;
  periodId: string;
  academicListing: string;
  studentYears: string;
  preschoolerSemester: string;
  setFilter: (key: keyof FilterStoreType, value: string) => void;
  setPeriodId: (value: string) => void;
};

export const useFilterStore = create<FilterStoreType>((set) => ({
  name: "",
  className: "",
  location: "",
  periodId: "",
  academicListing: "",
  studentYears: "",
  preschoolerSemester: "",
  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  setPeriodId: (value) => set({ periodId: value }),
}));
