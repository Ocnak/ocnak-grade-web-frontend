import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      classIds,
      location,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      classIds?: string[];
      location: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            classIds,
            location,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create teacher");
      }

      const data = await res.json();
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useFetchTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/with-classes`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch teachers with classes");
      }

      const data = await res.json();
      return data.teachers as {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        location: string;
        classes: { id: string; name: string }[];
      }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      firstName,
      lastName,
      email,
      location,
      classIds,
    }: {
      teacherId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      location?: string;
      classIds?: string[];
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/update/${teacherId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            location,
            classIds,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update teacher");
      }

      const data = await res.json();
      return data.user;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({
        queryKey: ["teachers", variables.teacherId],
      });
    },
  });
}

export function useFetchTeacherClasses(teacherId: string | null) {
  return useQuery({
    queryKey: ["teachers", teacherId, "classes"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/${teacherId}/classes`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch teacher's classes");
      }

      const data = await res.json();
      return data.classes as { id: string; name: string }[];
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teacherId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/${teacherId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete teacher");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useFetchTeacherById(teacherId: string | null) {
  return useQuery({
    queryKey: ["teachers", teacherId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers/${teacherId}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch teacher");
      }

      const data = await res.json();
      return data.teacher as {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        location: string;
        classes: { id: string; name: string }[];
      };
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
