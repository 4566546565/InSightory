import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionCookie(req: NextRequest): boolean {
  return (
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token")
  );
}

const PROTECTED_PREFIXES = [
  "/teacher",
  "/admin",
  "/profile",
  "/practice",
  "/knowledge",
  "/timeline",
  "/sources",
  "/themes",
  "/atlas",
  "/lectures",
  "/readings",
  "/guides",
  "/community",
  "/chat",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = hasSessionCookie(req);

  // Homepage: logged in → go to knowledge, not logged in → go to login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isLoggedIn ? "/knowledge" : "/login", req.url)
    );
  }

  // Protected routes - quick cookie existence check (actual auth verification happens in pages/layout)
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
