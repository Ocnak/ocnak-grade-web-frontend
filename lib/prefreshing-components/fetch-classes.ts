const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/classes`;

export const CLASSES_QUERY_KEY = ["get-all-classes"] as const;

// returns the whole payload ({ classes }), the same shape useFetchClasses always returned
export async function fetchClasses(cookie?: string) {
  const res = await fetch(`${BASE_URL}/get-all`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch classes");
  return res.json();
}
