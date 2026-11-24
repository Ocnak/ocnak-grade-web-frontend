"use client";

import { useMemo } from "react";
import { useFetchUserData } from "@/hooks/use-users-info";
import type { TrackingScope } from "./use-teacher-scope";

// Scanners see every class at their own location. The backend already limits
// them to it; this filters the lists again on the client in case it ever sends more.
export function useScannerScope() {
  const { data: userData, isLoading } = useFetchUserData();
  // null when the scanner's location isn't known; the backend still limits it
  const location: string | null = userData?.user?.location || null;

  const scope = useMemo<TrackingScope>(
    () => ({ classIds: null, location }),
    [location],
  );

  return { scope, isLoading };
}
