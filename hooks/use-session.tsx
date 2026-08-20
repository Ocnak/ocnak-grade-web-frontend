import { authClient } from "@/lib/auth-client"; // your better-auth client instance
import { useQuery } from "@tanstack/react-query";

export const sessionQueryFn = async () => {
  const { data } = await authClient.getSession();
  return data ?? null;
};

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: sessionQueryFn,
    staleTime: 1000 * 60 * 5, // cache for 5 min, avoid refetching on every render
    gcTime: 1000 * 60 * 5, // ← keep in cache 5 min
    retry: false,
    refetchOnWindowFocus: true,
  });
}
