import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies"; // Built-in helper

export function proxy(request: NextRequest) {
  // 1. Optimistic check: See if the session cookie exists

  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "ocnak",
  });

  // 2. If it doesn't exist and they are trying to hit a protected route
  if (!sessionCookie) {
    // Redirect them right back to login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// 3. Define which exact routes you want this rule to apply to
export const config = {
  matcher: ["/admin-dashboard/:path*", "/teacher/:path*"],
};
