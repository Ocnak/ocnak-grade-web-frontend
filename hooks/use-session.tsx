import { authClient } from "@/lib/auth-client"; // your better-auth client instance
import { useQuery } from "@tanstack/react-query";
import { SESSION_QUERY_KEY } from "@/lib/prefreshing-components/fetch-session";

export const sessionQueryFn = async () => {
  const { data } = await authClient.getSession();
  return data ?? null;
};

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: sessionQueryFn,
    staleTime: 1000 * 60 * 5, // cache for 5 min, avoid refetching on every render
    gcTime: 1000 * 60 * 5, // ← keep in cache 5 min
    retry: false,
    refetchOnWindowFocus: true,
  });
}
