import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  // 🔓 public routes
  const publicPaths = [
    "/",
    "/register",
    "/ForgotPassword",
    "/login/line",       // LIFF
    "/Paddy/admin/login"
  ];

  // ⛔ allow static / api / assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // 🔓 public path
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 🔐 protected
  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

