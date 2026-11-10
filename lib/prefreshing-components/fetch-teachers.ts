const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teachers`;

export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  classes: { id: string; name: string }[];
};

// the server and the client share this key, so the prefetched data is picked up
export const TEACHERS_QUERY_KEY = ["teachers"] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchTeachers(cookie?: string): Promise<Teacher[]> {
  const res = await fetch(`${BASE_URL}/with-classes`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server, or one user could see another's response
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch teachers with classes");
  }

  const data = await res.json();
  return data.teachers as Teacher[];
}
