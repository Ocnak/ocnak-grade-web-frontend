const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/periods`;

// the server and the client share this key, so the prefetched data is picked up
export const PERIODS_QUERY_KEY = ["periods"] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchPeriods(cookie?: string) {
  const res = await fetch(`${BASE_URL}/get-all`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch periods");
  }

  const data = await res.json();
  return data.periods;
}
