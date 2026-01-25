// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/login/line",
    "/register",
    "/ForgotPassword",
    "/Paddy/admin/login",
  ];

  // ✅ public routes
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ✅ static / api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // ❌ no token
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|login/line).*)",
  ],
};
