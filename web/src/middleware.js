import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/login/line",
    "/register",
    "/Paddy/admin/login",
    "/ForgotPassword",
  ];

  // ✅ อนุญาต public path
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }


  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login/line")) {
  return NextResponse.next();
}

  if (!token) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/((?!login/line|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
