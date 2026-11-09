import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./use-session";
import {
  TRACKING_URL,
  apiRequest,
  attendanceKeys,
  toQuery,
  trackingKeys,
  type ClassInfo,
  type ScanStatus,
  type TrackingStatus,
} from "../lib/types/student-attendance-shared";

export type LiveStudent = {
  id: string;
  name: string;
  location: string;
  class: ClassInfo;
  status: TrackingStatus;
  statusAt: string | null;
  source: string | null;
  reason: string | null;
  scannedBy: string | null;
};

export type LiveTracking = {
  students: LiveStudent[];
  updatedAt: string;
};

export type StatusEvent = {
  id: string;
  status: TrackingStatus;
  previousStatus: TrackingStatus | null;
  scannedAt: string;
  source: string;
  reason: string | null;
  scannerFirstName: string | null;
  scannerLastName: string | null;
};

export type QrCard = {
  studentId: string;
  firstName: string;
  lastName: string;
  qrToken: string;
  class: ClassInfo;
  location: string;
};

export type StatusChangeResult = {
  result: "updated" | "already_set";
  status: ScanStatus;
  previousStatus?: TrackingStatus;
};

export type ScanResult = StatusChangeResult & {
  student: { id: string; name: string; location: string };
};

// After any status change, refresh what shows where students are and whether they came in
function invalidateAfterStatusChange(
  queryClient: ReturnType<typeof useQueryClient>,
  studentId: string,
) {
  queryClient.invalidateQueries({ queryKey: trackingKeys.live() });
  queryClient.invalidateQueries({ queryKey: trackingKeys.events(studentId) });
  queryClient.invalidateQueries({ queryKey: attendanceKeys.daily() });
  queryClient.invalidateQueries({ queryKey: attendanceKeys.summary() });
  queryClient.invalidateQueries({
    queryKey: attendanceKeys.student(studentId),
  });
}

export function useLiveTracking() {
  const { data: session, isLoading: sessionLoading } = useSession();

  return useQuery({
    queryKey: trackingKeys.live(),
    queryFn: () =>
      apiRequest<LiveTracking>(
        `${TRACKING_URL}/live`,
        "Failed to load live tracking",
      ),
    enabled: !!session?.user && !sessionLoading,
    // scans from other devices don't reach this browser, so poll
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 1,
  });
}

export function useStudentEvents(
  studentId: string | null,
  params: { from?: string; to?: string } = {},
) {
  const query = { from: params.from, to: params.to };

  return useQuery({
    queryKey: trackingKeys.events(studentId ?? undefined, query),
    queryFn: async () => {
      const data = await apiRequest<{ events: StatusEvent[] }>(
        `${TRACKING_URL}/students/${studentId}/events${toQuery(query)}`,
        "Failed to load student events",
      );
      return data.events;
    },
    enabled: !!studentId,
    staleTime: 1000 * 30,
    retry: 1,
  });
}

export function useQrCards(
  params: { location?: string | null; classId?: string | null },
  enabled = true,
) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const query = { location: params.location, classId: params.classId };

  return useQuery({
    queryKey: trackingKeys.qrCards(query),
    queryFn: async () => {
      const data = await apiRequest<{ cards: QrCard[] }>(
        `${TRACKING_URL}/qr-cards${toQuery(query)}`,
        "Failed to load QR cards",
      );
      return data.cards;
    },
    enabled: enabled && !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 60 * 5, // 5 hours
    gcTime: 1000 * 60 * 60 * 5, // 5 hours
    retry: 1,
  });
}

export function useScanStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, status }: { token: string; status: ScanStatus }) =>
      apiRequest<ScanResult>(`${TRACKING_URL}/scan`, "Failed to record scan", {
        method: "POST",
        body: JSON.stringify({ token, status }),
      }),
    onSuccess: (data) => {
      // a repeat scan changes nothing, so skip the refetch
      if (data.result === "updated")
        invalidateAfterStatusChange(queryClient, data.student.id);
    },
  });
}

export function useChangeStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      status,
      reason,
    }: {
      studentId: string;
      status: ScanStatus;
      reason?: string;
    }) =>
      apiRequest<StatusChangeResult>(
        `${TRACKING_URL}/students/${studentId}/status`,
        "Failed to change student status",
        {
          method: "POST",
          body: JSON.stringify({ status, reason }),
        },
      ),
    onSuccess: (data, variables) => {
      if (data.result === "updated")
        invalidateAfterStatusChange(queryClient, variables.studentId);
    },
  });
}

export function useReissueQrCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) =>
      apiRequest<{ studentId: string; qrToken: string }>(
        `${TRACKING_URL}/students/${studentId}/qr/reissue`,
        "Failed to reissue QR card",
        {
          method: "POST",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.qrCards() });
    },
  });
}
