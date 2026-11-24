import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./use-session";
import {
  fetchScannerById,
  fetchScanners,
  scannerKey,
  SCANNERS_QUERY_KEY,
} from "@/lib/prefreshing-components/fetch-scanners";

// create a scanner (admins only)
export function useCreateScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      email,
      location,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      location: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scanners/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ firstName, lastName, email, location }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create scanner");
      }

      const data = await res.json();
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
    },
  });
}

// fetch all scanners (admin listing)
export function useFetchScanners() {
  const { data: session, isLoading: sessionLoading } = useSession();
  return useQuery({
    queryKey: SCANNERS_QUERY_KEY,
    queryFn: () => fetchScanners(),
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// fetch a single scanner by id
export function useFetchScannerById(scannerId: string | null) {
  return useQuery({
    queryKey: scannerKey(scannerId),
    queryFn: () => fetchScannerById(scannerId!),
    enabled: !!scannerId,
    staleTime: 1000 * 60 * 180,
    retry: 1,
  });
}

// update a scanner's name, email and location
export function useUpdateScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scannerId,
      firstName,
      lastName,
      email,
      location,
    }: {
      scannerId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      location?: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scanners/update/${scannerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ firstName, lastName, email, location }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update scanner");
      }

      const data = await res.json();
      return data.user;
    },
    onSuccess: () => {
      // prefix match covers ["scanners"] and ["scanners", id]
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
    },
  });
}

// delete a scanner (also ends their sessions on the backend)
export function useDeleteScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scannerId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scanners/${scannerId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to delete scanner");
      }

      return res.json();
    },
    onSuccess: (_data, scannerId) => {
      queryClient.removeQueries({ queryKey: ["scanners", scannerId] });
      queryClient.invalidateQueries({ queryKey: ["scanners"] });
    },
  });
}
