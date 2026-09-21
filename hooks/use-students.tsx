import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// fetch all students
export function useFetchStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/get-all`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch students");
      }
      const data = await res.json();
      return data.students;
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch student by id
export function useFetchStudentById(studentId: string | null) {
  return useQuery({
    queryKey: ["students", studentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/get-by-id/${studentId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch student");
      }
      const data = await res.json();
      return data.student;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// create a student
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      parentName,
      parentContact,
      parentEmail,
      conduct,
      daysAbsent,
      sick,
      timesTardy,
      location,
      classId,
    }: {
      firstName: string;
      lastName: string;
      parentName?: string;
      parentContact?: string;
      parentEmail?: string;
      conduct?: string;
      daysAbsent?: number;
      sick?: number;
      timesTardy?: number;
      location: string;
      classId: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            parentName,
            parentContact,
            parentEmail,
            conduct,
            daysAbsent,
            sick,
            timesTardy,
            location,
            classId,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create student");
      }
      const data = await res.json();
      // Return the whole payload now instead of just data.student, so
      // callers can see data.parent / data.parentError if they need to
      return data as {
        student: any;
        parent?: { linked: boolean; parentId: string | null } | null;
        parentError?: string;
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // A parent may have been created or linked as a side effect
      if (data.parent) {
        queryClient.invalidateQueries({ queryKey: ["parents"] });
      }
    },
  });
}

// update a student
// export function useUpdateStudent() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       studentId,
//       firstName,
//       lastName,
//       parentName,
//       parentContact,
//       parentEmail,
//       conduct,
//       daysAbsent,
//       sick,
//       timesTardy,
//       location,
//       classId,
//     }: {
//       studentId: string;
//       firstName?: string;
//       lastName?: string;
//       parentName?: string;
//       parentContact?: string;
//       parentEmail?: string;
//       conduct?: string;
//       daysAbsent?: number;
//       sick?: number;
//       timesTardy?: number;
//       location?: string;
//       classId?: string;
//     }) => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/update/${studentId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             firstName,
//             lastName,
//             parentName,
//             parentContact,
//             parentEmail,
//             conduct,
//             daysAbsent,
//             sick,
//             timesTardy,
//             location,
//             classId,
//           }),
//         },
//       );
//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.error ?? "Failed to update student");
//       }
//       const data = await res.json();
//       return data as {
//         student: any;
//         parent?: { linked: boolean; parentId: string | null } | null;
//         parentError?: string;
//       };
//     },
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["students"] });
//       queryClient.invalidateQueries({
//         queryKey: ["students", variables.studentId],
//       });
//       if (data.parent) {
//         queryClient.invalidateQueries({ queryKey: ["parents"] });
//       }
//     },
//   });
// }

// update a student
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      firstName,
      lastName,
      parentName,
      parentContact,
      parentEmail,
      conduct,
      daysAbsent,
      sick,
      timesTardy,
      location,
      classId,
    }: {
      studentId: string;
      firstName?: string;
      lastName?: string;
      parentName?: string;
      parentContact?: string;
      parentEmail?: string;
      conduct?: string;
      daysAbsent?: number;
      sick?: number;
      timesTardy?: number;
      location?: string;
      classId?: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/update/${studentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            parentName,
            parentContact,
            parentEmail,
            conduct,
            daysAbsent,
            sick,
            timesTardy,
            location,
            classId,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update student");
      }
      const data = await res.json();
      return data as {
        student: any;
        parent?: { linked: boolean; parentId: string | null } | null;
        parentError?: string;
        parentUnlinked?: boolean;
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["students", variables.studentId],
      });

      // Refresh parents list whether a parent was linked OR unlinked
      if (data.parent || data.parentUnlinked) {
        queryClient.invalidateQueries({ queryKey: ["parents"] });
      }
    },
  });
}

// delete multiple students
export function useDeleteStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ids }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete students");
      }
      return res.json() as Promise<{
        success: boolean;
        deleted: any[];
        removedParentIds: string[];
      }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // A parent account may have been removed as a side effect
      if (data.removedParentIds?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["parents"] });
      }
    },
  });
}

// input students grades
export function useInputGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      gradeEntries: {
        studentId: string;
        subjectId: string;
        periodId: string;
        classId: string;
        numericGrade?: number | null;
        letterGrade?: string | null;
      }[],
    ) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/input-grades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(gradeEntries),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to input student grades");
      }
      const data = await res.json();
      return data.grades;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
    },

    onError: (error) => {
      console.log("Error inputting grades:", error.message);
    },
  });
}

// fetch students by classId
export function useFetchStudentsByClass(classId: string | null) {
  return useQuery({
    queryKey: ["students", "by-class", classId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students/by-class/${classId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch students by class");
      const data = await res.json();
      return data.students;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 180,
  });
}
