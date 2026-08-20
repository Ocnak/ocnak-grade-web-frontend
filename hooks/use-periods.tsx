import { useQuery } from "@tanstack/react-query";

// fetch all periods
export function useFetchPeriods() {
  return useQuery({
    queryKey: ["periods"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/periods/get-all`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch periods");
      }
      const data = await res.json();
      return data.periods;
    },
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch period by id
export function useFetchPeriodById(periodId: string | null) {
  return useQuery({
    queryKey: ["periods", periodId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/periods/get-by-id/${periodId}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to fetch period");
      }
      const data = await res.json();
      return data.period;
    },
    enabled: !!periodId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}
