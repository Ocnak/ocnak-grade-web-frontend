const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/academic-settings`;

export const SEMESTERS = ["Semester 1", "Semester 2"] as const;
export type Semester = (typeof SEMESTERS)[number];

export type AcademicSettings = {
  currentPeriod: { id: string; period: number | null } | null;
  currentSemester: Semester | null;
};

// the server and the client share this key, so the prefetched data is picked up
export const ACADEMIC_SETTINGS_QUERY_KEY = ["academic-settings"] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchAcademicSettings(
  cookie?: string,
): Promise<AcademicSettings> {
  const res = await fetch(BASE_URL, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch the current term");
  }

  const data = await res.json();
  return data.settings;
}

export async function updateAcademicSettings(values: {
  currentPeriodId: string | null;
  currentSemester: Semester | null;
}): Promise<AcademicSettings> {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(data?.error ?? "Failed to save the current term");
  return data.settings;
}
