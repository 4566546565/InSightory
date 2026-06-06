import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookie } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await getSessionFromCookie(req.headers.get("cookie"));

  // Protected routes - require login
  if (
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/knowledge") ||
    pathname.startsWith("/timeline") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/themes") ||
    pathname.startsWith("/atlas") ||
    pathname.startsWith("/lectures") ||
    pathname.startsWith("/readings") ||
    pathname.startsWith("/guides") ||
    pathname.startsWith("/chat")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Role-based access
  if (pathname.startsWith("/teacher") && user?.role !== "TEACHER" && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*", "/profile/:path*", "/practice/:path*", "/knowledge/:path*", "/timeline/:path*", "/sources/:path*", "/themes/:path*", "/atlas/:path*", "/lectures/:path*", "/readings/:path*", "/guides/:path*", "/chat/:path*"],
};
