import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "shopaccount_session";
const DEMO_MODE_COOKIE = "shopaccount_demo";

export async function middleware(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const { pathname } = new URL(request.url);

  // Mock session from cookie (demo mode)
  let sessionUser: { role: string } | null = null;
  if (sessionCookie?.value) {
    try {
      sessionUser = JSON.parse(sessionCookie.value);
    } catch {
      // invalid cookie
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (sessionUser.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && sessionUser) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};
