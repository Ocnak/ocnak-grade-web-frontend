import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchParentMe,
  fetchParentStudentGrades,
  fetchParentsWithStudents,
  PARENT_ME_QUERY_KEY,
  parentStudentGradesKey,
  PARENTS_WITH_STUDENTS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-parents";

// create a parent
export function useCreateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      studentIds,
      location,
    }: {
      firstName?: string;
      lastName?: string;
      email: string;
      studentIds?: string[];
      location?: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            studentIds,
            location,
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create parent");
      }
      const data = await res.json();
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });
}

// fetch all parents with their linked children (admin listing)
export function useFetchParentsWithStudents() {
  return useQuery({
    queryKey: PARENTS_WITH_STUDENTS_QUERY_KEY,
    queryFn: () => fetchParentsWithStudents(),
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// the logged-in parent, with their children
export function useFetchParent() {
  return useQuery({
    queryKey: PARENT_ME_QUERY_KEY,
    queryFn: () => fetchParentMe(),
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// update a parent's name, email and contact
export function useUpdateParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      firstName,
      lastName,
      email,
      contact,
    }: {
      parentId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      contact?: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents/update/${parentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ firstName, lastName, email, contact }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update parent");
      }

      const data = await res.json();
      return data.user;
    },
    onSuccess: () => {
      // prefix match covers ["parents", "with-students"], ["parents", id], etc.
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      // any student view that displays parent info
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
// fetch all children linked to a parent
export function useFetchParentStudents(parentId: string | null) {
  return useQuery({
    queryKey: ["parents", parentId, "students"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents/${parentId}/students`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch parent's students");
      }

      const data = await res.json();
      return data.students as {
        id: string;
        firstName: string;
        lastName: string;
        classesId: string | null;
        className: string | null;
        location: string | null;
      }[];
    },
    enabled: !!parentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch a child's approved grades only — the parent-facing view
export function useFetchParentStudentGrades(
  parentId: string | null,
  studentId: string | null,
) {
  return useQuery({
    queryKey: parentStudentGradesKey(parentId, studentId),
    queryFn: () => fetchParentStudentGrades(parentId!, studentId!),
    enabled: !!parentId && !!studentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch a single parent by id
export function useFetchParentById(parentId: string | null) {
  return useQuery({
    queryKey: ["parents", parentId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents/${parentId}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch parent");
      }

      const data = await res.json();
      return data.parent as {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        contact: string | null;
      };
    },
    enabled: !!parentId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// delete a parent
export function useDeleteParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/parents/${parentId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete parent");
      }

      return res.json();
    },

    onSuccess: (_data, parentId) => {
      queryClient.removeQueries({ queryKey: ["parents", parentId] });
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
