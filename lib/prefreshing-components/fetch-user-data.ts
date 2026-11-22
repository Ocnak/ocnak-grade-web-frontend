import type { QueryClient } from "@tanstack/react-query";
import { fetchSession, SESSION_QUERY_KEY } from "./fetch-session";

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`;

// the server and the client share this key, so the prefetched data is picked up
export const userDataKey = (userId?: string | null) =>
  ["get-user-data", userId] as const;

// cookie: only passed on the server, where the browser's cookies aren't sent automatically
export async function fetchUserData(cookie?: string) {
  const res = await fetch(`${BASE_URL}/get-personal-details`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? "Failed to fetch user details");
  }

  return res.json();
}

// server only: prefetch the session and the signed-in user's details.
// Both are needed: useFetchUserData() keys on session.user.id, so without the
// session in the cache the hydrated user data would be ignored on the client.
// If anything fails, nothing is passed down and the client fetches as before.
export async function prefetchCurrentUser(
  queryClient: QueryClient,
  cookie: string,
) {
  if (!cookie) return;

  try {
    const session = await fetchSession(cookie);
    const userId = session?.user?.id;
    if (!userId) return;

    queryClient.setQueryData(SESSION_QUERY_KEY, session);
    await queryClient.prefetchQuery({
      queryKey: userDataKey(userId),
      queryFn: () => fetchUserData(cookie),
    });
  } catch {
    // client falls back to fetching
  }
}
