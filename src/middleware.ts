export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/shop-account-adm-notuser")) {
      if (!session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (session.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if ((pathname === "/login" || pathname === "/register") && session?.user) {
      if (session.user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/shop-account-adm-notuser", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/shop-account-adm-notuser/:path*",
    "/login",
    "/register",
  ],
};
