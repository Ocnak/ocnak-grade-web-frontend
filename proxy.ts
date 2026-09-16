import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie, getCookieCache } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request, { cookiePrefix: "ocnak" });
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Best-effort only — NOT the security boundary. See layout check below.
  const cached = await getCookieCache(request, {
    cookiePrefix: "ocnak",
    secret: process.env.BETTER_AUTH_SECRET, // must match the backend's secret
  });
  const role = cached?.user?.userRole;

  if (pathname.startsWith("/admin-dashboard") && role && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  if (pathname.startsWith("/teacher") && role && role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-dashboard/:path*", "/teacher/:path*"],
};
