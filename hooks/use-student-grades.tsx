import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// fetch grades by student id
export const useStudentGrades = (studentId: string) => {
  return useQuery({
    queryKey: ["student-grades", studentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-grades/by-student/${studentId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch student grades");
      }
      const data = await res.json();
      return data.grades;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
};

// fetch grades by period and class
export const useGradesByPeriod = (periodId: string, classId: string) => {
  return useQuery({
    queryKey: ["students-grades-by-period", periodId, classId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-grades/by-period/${periodId}/${classId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch grades by period");
      }
      const data = await res.json();
      return data.grades;
    },
    enabled: !!periodId && !!classId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
};

// fetch honor roll & principal's list
export const useFetchHonorStudents = () => {
  return useQuery({
    queryKey: ["honor-students"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-grades/honor-roll/all`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch honor students");
      }
      const data = await res.json();
      return data.students;
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
};

// delete a grade
export function useDeleteStudentGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      subjectId,
      periodId,
    }: {
      studentId: string;
      subjectId: string;
      periodId: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-grades/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studentId, subjectId, periodId }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete student grade");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
      queryClient.invalidateQueries({
        queryKey: ["students-grades-by-period"],
      });
    },
  });
}
