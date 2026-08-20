import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Archive one or multiple students
export function useArchiveStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentIds: string[]) => {
      const res = await fetch(`${BASE_URL}/api/archived-students/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentIds }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to archive students");
      }

      const data = await res.json();
      return data as {
        success: boolean;
        archivedCount: number;
        errors: string[];
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-students"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// Fetch all archived students
export function useFetchArchivedStudents() {
  return useQuery({
    queryKey: ["archived-students"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/archived-students/get-all`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch archived students");
      }

      const data = await res.json();
      return data.students as {
        id: string;
        originalStudentId: string;
        firstName: string;
        lastName: string;
        classId: string | null;
        parentName: string | null;
        parentContact: string | null;
        academicYear: string;
        originalCreatedAt: Date;
      }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// Fetch a single archived student by id
export function useFetchArchivedStudentById(studentId: string | null) {
  return useQuery({
    queryKey: ["archived-students", studentId],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/api/archived-students/get-by-id/${studentId}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch archived student");
      }

      const data = await res.json();
      return data.student as {
        id: string;
        originalStudentId: string;
        firstName: string;
        lastName: string;
        classId: string | null;
        parentName: string | null;
        parentContact: string | null;
        academicYear: string;
        originalCreatedAt: Date;
      };
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// Fetch grades for an archived student
export function useFetchArchivedStudentGrades(
  archivedStudentId: string | null,
) {
  return useQuery({
    queryKey: ["archived-students", archivedStudentId, "grades"],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/api/archived-students/${archivedStudentId}/grades`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch archived student grades");
      }

      const data = await res.json();
      return data.grades as {
        id: string;
        originalGradeId: string;
        archivedStudentId: string;
        subjectId: string;
        periodId: string;
        numericGrade: number | null;
        letterGrade: string | null;
      }[];
    },
    enabled: !!archivedStudentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// Delete one or multiple archived students
export function useDeleteArchivedStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`${BASE_URL}/api/archived-students/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete archived students");
      }

      const data = await res.json();
      return data as { success: boolean; deletedCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archived-students"] });
    },
  });
}

// Fetch distinct academic years from archived students
export function useFetchAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/api/archived-students/academic-years`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch academic years");
      }

      const data = await res.json();
      return data.years as string[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
