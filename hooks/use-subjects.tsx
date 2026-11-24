import { useQuery } from "@tanstack/react-query";
import {
  fetchSubjectsByClass,
  subjectsByClassKey,
} from "@/lib/prefreshing-components/fetch-subjects";

// fetch all subjects
export const useFetchSubjects = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/subjects/get-all`,
        { credentials: "include" },
      );

      if (!res.ok) throw new Error("Failed to fetch subjects");

      const data = await res.json();
      return data.subjects as { id: string; name: string }[];
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
};

// fetch subjects by class
export const useFetchSubjectsByClass = (classId: string | null) => {
  return useQuery({
    queryKey: subjectsByClassKey(classId),
    queryFn: () => fetchSubjectsByClass(classId!),
    enabled: !!classId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
};
