import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./use-session";
import {
  ACADEMIC_SETTINGS_QUERY_KEY,
  fetchAcademicSettings,
  updateAcademicSettings,
} from "@/lib/prefreshing-components/fetch-academic-settings";

// the current period and semester
export function useAcademicSettings() {
  const { data: session, isLoading: sessionLoading } = useSession();
  return useQuery({
    queryKey: ACADEMIC_SETTINGS_QUERY_KEY,
    queryFn: () => fetchAcademicSettings(),
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// admins only: set the current period and semester
export function useUpdateAcademicSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAcademicSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(ACADEMIC_SETTINGS_QUERY_KEY, settings);
    },
  });
}
