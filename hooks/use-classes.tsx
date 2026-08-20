import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFetchClasses() {
  return useQuery({
    queryKey: ["get-all-classes"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/get-all`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch classes");
      return res.json();
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

export function useFetchClassById(classId: string | null) {
  return useQuery({
    queryKey: ["get-class", classId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/get-by-id/${classId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch class");
      return res.json();
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

export function useFetchMultipleClasses(classIds: string[] | null) {
  return useQuery({
    queryKey: ["get-multiple-classes", classIds],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/get-multiple`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ classIds }),
        },
      );
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      return data.classes;
    },
    enabled: !!classIds && classIds.length > 0,
    staleTime: 1000 * 60 * 120,
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        },
      );
      if (!res.ok) throw new Error("Failed to create class");
      const data = await res.json();
      return data.class;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-classes"] });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/delete/${classId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("Failed to delete class");
      const data = await res.json();
      return data.class;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-all-classes"] });
    },
  });
}

export function useAddSubjectToClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectName,
      classIds,
    }: {
      subjectName: string;
      classIds: string[];
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/add-subjects-to-classes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subjectName, classIds }),
        },
      );
      if (!res.ok) throw new Error("Failed to add subject");
      const data = await res.json();
      return data.subject;
    },
    onSuccess: (_data, variables) => {
      // invalidate any per-class subject lists affected by this mutation
      variables.classIds.forEach((classId) => {
        queryClient.invalidateQueries({
          queryKey: ["subjects", "by-class", classId],
        });
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-subjects"] });
    },
  });
}

export function useRemoveSubjectFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subjectId,
      classId,
    }: {
      subjectId: string;
      classId: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/remove-subject-from-class`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ subjectId, classId }),
        },
      );
      if (!res.ok) throw new Error("Failed to remove subject from class");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subjects", "by-class", variables.classId],
      });
      queryClient.invalidateQueries({ queryKey: ["get-all-subjects"] });
      queryClient.invalidateQueries({ queryKey: ["student-grades"] });
    },
  });
}

export function useTeacherClasses(teacherId: string | null) {
  return useQuery({
    queryKey: ["classes", teacherId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes/by-teacher/${teacherId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      return data.classes;
    },
    enabled: !!teacherId,
  });
}
