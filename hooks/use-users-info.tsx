import { useQuery } from "@tanstack/react-query";
import { useSession } from "./use-session";
import {
  fetchUserData,
  userDataKey,
} from "@/lib/prefreshing-components/fetch-user-data";

export function useFetchUserData() {
  const { data: session, isLoading: sessionLoading } = useSession();
  return useQuery({
    queryKey: userDataKey(session?.user?.id),
    queryFn: () => fetchUserData(),
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
