import { useQuery } from "@tanstack/react-query";
import { useSession } from "./use-session";

export function useFetchUserData() {
  const { data: session, isLoading: sessionLoading } = useSession();
  return useQuery({
    queryKey: ["get-user-data", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/get-personal-details`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("Failed to fetch user details");
      return res.json();
    },
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
