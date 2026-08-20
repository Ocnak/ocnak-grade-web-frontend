import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StudentIdState {
  studentId: string | null;
  setStudentId: (id: string) => void;
  clearStudentId: () => void;
}

export const useStudentIdStore = create<StudentIdState>()(
  persist(
    (set) => ({
      studentId: null,
      setStudentId: (id: string) => set({ studentId: id }),
      clearStudentId: () => set({ studentId: null }),
    }),
    {
      name: "student-id-storage", // key in localStorage
    },
  ),
);
