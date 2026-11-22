// the server and the client share this key, so the prefetched session is picked up by useSession()
export const SESSION_QUERY_KEY = ["session"] as const;

// server only: the client keeps using authClient.getSession() (see hooks/use-session.tsx)
// cookie: the browser's cookies aren't sent automatically on the server
export async function fetchSession(cookie?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`,
    {
      credentials: "include",
      headers: cookie ? { cookie } : undefined,
      // signed-in data: never cache it on the server, or one user could see another's session
      cache: "no-store",
    },
  );

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  return data ?? null;
}
