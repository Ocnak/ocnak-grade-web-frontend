import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "./use-session";
import {
  ATTENDANCE_URL,
  apiRequest,
  attendanceKeys,
  toQuery,
  trackingKeys,
  type AttendanceStatus,
  type ClassInfo,
  type DayStatus,
} from "../lib/types/student-attendance-shared";

export type DailyStudent = {
  id: string;
  name: string;
  class: ClassInfo;
  status: DayStatus;
  firstArrivalAt: string | null;
  source: "scan" | "manual" | null;
  reason: string | null;
};

export type DailyAttendance = {
  date: string;
  location: string;
  isSchoolDay: boolean;
  counts: Partial<Record<DayStatus, number>>;
  students: DailyStudent[];
};

export type SummaryStudent = Record<AttendanceStatus, number> & {
  id: string;
  name: string;
  class: ClassInfo;
  schoolDays: number;
};

export type AttendanceSummary = {
  from: string;
  to: string;
  location: string;
  students: SummaryStudent[];
};

export type StudentAttendanceDay = {
  date: string;
  status: DayStatus;
  firstArrivalAt: string | null;
  source: "scan" | "manual" | null;
  reason: string | null;
};

export type StudentAttendance = {
  student: { id: string; name: string };
  days: StudentAttendanceDay[];
};

export type AttendanceSettings = {
  location: string;
  timeZone: string;
  tardyCutoff: string;
  startDate: string;
};

export type NonSchoolDay = {
  id: string;
  location: string;
  date: string;
  reason: string | null;
};

export type GridCell = {
  status: DayStatus;
  source: "scan" | "manual" | null;
  reason: string | null;
  firstArrivalAt: string | null;
};

export type AttendanceGridStudent = {
  id: string;
  name: string;
  location: string;
  days: GridCell[];
};

export type AttendanceGrid = {
  dates: string[];
  students: AttendanceGridStudent[];
  missingSettings: string[];
};

// Settings and closed days change how every day is counted
function invalidateAttendanceViews(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: attendanceKeys.daily() });
  queryClient.invalidateQueries({ queryKey: attendanceKeys.summary() });
  queryClient.invalidateQueries({ queryKey: attendanceKeys.student() });
}

export function useDailyAttendance(params: {
  date?: string | null;
  location?: string | null;
  classId?: string | null;
}) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const query = {
    date: params.date,
    location: params.location,
    classId: params.classId,
  };

  return useQuery({
    queryKey: attendanceKeys.daily(query),
    queryFn: () =>
      apiRequest<DailyAttendance>(
        `${ATTENDANCE_URL}/daily${toQuery(query)}`,
        "Failed to load daily attendance",
      ),
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useAttendanceSummary(params: {
  from?: string | null;
  to?: string | null;
  location?: string | null;
  classId?: string | null;
}) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const query = {
    from: params.from,
    to: params.to,
    location: params.location,
    classId: params.classId,
  };

  return useQuery({
    queryKey: attendanceKeys.summary(query),
    queryFn: () =>
      apiRequest<AttendanceSummary>(
        `${ATTENDANCE_URL}/summary${toQuery(query)}`,
        "Failed to load attendance summary",
      ),
    enabled: !!session?.user && !sessionLoading && !!params.from && !!params.to,
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useStudentAttendance(
  studentId: string | null,
  params: { from?: string | null; to?: string | null },
) {
  const query = { from: params.from, to: params.to };

  return useQuery({
    queryKey: attendanceKeys.student(studentId ?? undefined, query),
    queryFn: () =>
      apiRequest<StudentAttendance>(
        `${ATTENDANCE_URL}/students/${studentId}${toQuery(query)}`,
        "Failed to load student attendance",
      ),
    enabled: !!studentId && !!params.from && !!params.to,
    staleTime: 1000 * 60,
    retry: 1,
  });
}

export function useAttendanceSettings(location?: string | null) {
  const { data: session, isLoading: sessionLoading } = useSession();

  return useQuery({
    queryKey: attendanceKeys.settings(location),
    queryFn: async () => {
      const data = await apiRequest<{ settings: AttendanceSettings | null }>(
        `${ATTENDANCE_URL}/settings${toQuery({ location })}`,
        "Failed to load attendance settings",
      );
      return data.settings;
    },
    enabled: !!session?.user && !sessionLoading,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useSaveAttendanceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AttendanceSettings) =>
      apiRequest<{ settings: AttendanceSettings }>(
        `${ATTENDANCE_URL}/settings`,
        "Failed to save attendance settings",
        {
          method: "PUT",
          body: JSON.stringify(settings),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-attendance", "settings"],
      });
      invalidateAttendanceViews(queryClient);
      // the time zone decides what counts as today on the live board
      queryClient.invalidateQueries({ queryKey: trackingKeys.live() });
    },
  });
}

export function useNonSchoolDays(params: {
  location?: string | null;
  from?: string | null;
  to?: string | null;
}) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const query = { location: params.location, from: params.from, to: params.to };

  return useQuery({
    queryKey: attendanceKeys.nonSchoolDays(query),
    queryFn: async () => {
      const data = await apiRequest<{ days: NonSchoolDay[] }>(
        `${ATTENDANCE_URL}/non-school-days${toQuery(query)}`,
        "Failed to load non-school days",
      );
      return data.days;
    },
    enabled: !!session?.user && !sessionLoading && !!params.from && !!params.to,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useAddNonSchoolDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (day: { location: string; date: string; reason?: string }) =>
      apiRequest<{ day: NonSchoolDay }>(
        `${ATTENDANCE_URL}/non-school-days`,
        "Failed to add non-school day",
        {
          method: "POST",
          body: JSON.stringify(day),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.nonSchoolDays(),
      });
      invalidateAttendanceViews(queryClient);
    },
  });
}

export function useDeleteNonSchoolDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ success: boolean }>(
        `${ATTENDANCE_URL}/non-school-days/${id}`,
        "Failed to remove non-school day",
        {
          method: "DELETE",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.nonSchoolDays(),
      });
      invalidateAttendanceViews(queryClient);
    },
  });
}

export function useSetAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      date,
      status,
      reason,
    }: {
      studentId: string;
      date: string;
      status: AttendanceStatus;
      reason?: string;
    }) =>
      apiRequest<{ record: unknown }>(
        `${ATTENDANCE_URL}/students/${studentId}/${date}`,
        "Failed to save attendance",
        {
          method: "PUT",
          body: JSON.stringify({ status, reason }),
        },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.daily() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.summary() });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.student(variables.studentId),
      });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.grid() });
    },
  });
}

export function useAttendanceGrid(params: {
  classId?: string | null;
  from: string;
  to: string;
}) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const query = { classId: params.classId, from: params.from, to: params.to };

  return useQuery({
    queryKey: attendanceKeys.grid(query),
    queryFn: () =>
      apiRequest<AttendanceGrid>(
        `${ATTENDANCE_URL}/grid${toQuery(query)}`,
        "Failed to load attendance",
      ),
    enabled: !!session?.user && !sessionLoading && !!params.classId,
    // keep last week on screen while the next week loads
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
