export const TRACKING_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-tracking`;
export const ATTENDANCE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student-attendance`;

export type TrackingStatus = "at_school" | "on_bus" | "off_campus";
export type ScanStatus = "at_school" | "on_bus" | "off_campus";
export type AttendanceStatus =
  "present" | "tardy" | "absent" | "excused" | "sick";
export type DayStatus =
  AttendanceStatus | "no_school" | "not_enrolled" | "upcoming" | "not_arrived";
export type ClassInfo = { id: string; name: string } | null;

export const SCHOOL_TIME_ZONE = "Africa/Monrovia";

type QueryParams = Record<string, string | null | undefined>;

export function toQuery(params: QueryParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiRequest<T>(
  url: string,
  fallbackError: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers: init.body
      ? { "Content-Type": "application/json", ...init.headers }
      : init.headers,
  });

  // the rate limiter may not send JSON, so never let parsing hide the real error
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? fallbackError);
  }

  return data as T;
}

export const trackingKeys = {
  all: ["student-tracking"] as const,
  live: (params?: QueryParams) =>
    params
      ? ["student-tracking", "live", params]
      : ["student-tracking", "live"],
  events: (studentId?: string, params?: QueryParams) =>
    studentId
      ? params
        ? ["student-tracking", "events", studentId, params]
        : ["student-tracking", "events", studentId]
      : ["student-tracking", "events"],
  qrCards: (params?: QueryParams) =>
    params
      ? ["student-tracking", "qr-cards", params]
      : ["student-tracking", "qr-cards"],
};

export const attendanceKeys = {
  all: ["student-attendance"] as const,
  daily: (params?: QueryParams) =>
    params
      ? ["student-attendance", "daily", params]
      : ["student-attendance", "daily"],
  summary: (params?: QueryParams) =>
    params
      ? ["student-attendance", "summary", params]
      : ["student-attendance", "summary"],
  student: (studentId?: string, params?: QueryParams) =>
    studentId
      ? params
        ? ["student-attendance", "student", studentId, params]
        : ["student-attendance", "student", studentId]
      : ["student-attendance", "student"],
  settings: (location?: string | null) => [
    "student-attendance",
    "settings",
    location ?? "mine",
  ],
  nonSchoolDays: (params?: QueryParams) =>
    params
      ? ["student-attendance", "non-school-days", params]
      : ["student-attendance", "non-school-days"],
  grid: (params?: QueryParams) =>
    params
      ? ["student-attendance", "grid", params]
      : ["student-attendance", "grid"],
};
