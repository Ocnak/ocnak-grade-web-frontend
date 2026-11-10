import { cookies } from "next/headers";

// server only: the session cookies to forward to the backend, in Cookie header format
export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("ocnak."))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}
