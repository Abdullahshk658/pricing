import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, hasAuthCookie } from "@/lib/auth";

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = hasAuthCookie(authCookieValue);

  if (!isAuthenticated) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pricing/:path*", "/admin/:path*", "/api/products/:path*", "/api/export/:path*"],
};