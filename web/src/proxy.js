// // src/proxy.js
// import { NextResponse } from "next/server";

// export default function proxy(request) {
//   const token = request.cookies.get("accessToken")?.value;
//   const { pathname } = request.nextUrl;

//   const publicPaths = [
//     "/",
//     "/login/line",
//     "/register",
//     "/ForgotPassword",
//     "/Paddy/admin/login",
//   ];


//   if (publicPaths.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }


//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api") ||
//     pathname.startsWith("/static")
//   ) {
//     return NextResponse.next();
//   }

//   if (!token) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!api|_next|favicon.ico|login/line).*)"],
// };


// src/proxy.js
import { NextResponse } from "next/server";

export default function proxy(request) {
  const token = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/",
    "/login/line",
    "/register",
    "/ForgotPassword",
    "/Paddy/admin/login",
  ];

  // ✅ public routes (exact match เท่านั้น)
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


  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};