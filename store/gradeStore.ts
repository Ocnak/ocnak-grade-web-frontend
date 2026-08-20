import { create } from "zustand";

type GradeStoreType = {
  student_id: string;
  subject_id: string;
  period_id: string;
  grades: number;
  setGradesField: (field: keyof GradeStoreType, value: string | number) => void;
  reset: () => void;
};

export const useGradeStore = create<GradeStoreType>((set) => ({
  student_id: "",
  subject_id: "",
  period_id: "",
  grades: 0,
  setGradesField: (field, value) =>
    set((state) => ({ ...state, [field]: value })),
  reset: () =>
    set({
      student_id: "",
      subject_id: "",
      period_id: "",
      grades: 0,
    }),
}));
