const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/students`;

export const STUDENTS_QUERY_KEY = ["students"] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchStudents(cookie?: string) {
  const res = await fetch(`${BASE_URL}/get-all`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch students");
  }

  const data = await res.json();
  return data.students;
}
