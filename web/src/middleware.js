import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/register",
    "/Paddy/admin/login",
  ];

  // อนุญาต static / api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}


