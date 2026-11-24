// GET from the backend, for fetchers shared by a client hook and a server prefetch.
// Browser: credentials:"include" sends the cookies.
// Server: the caller passes the request's session cookie in.
export async function backendGet<T>(
  path: string,
  errorMessage: string,
  cookie?: string,
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
    credentials: "include",
    headers: cookie ? { cookie } : undefined,
    // signed-in data: never cache it on the server
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error ?? errorMessage);
  }

  return res.json();
}
