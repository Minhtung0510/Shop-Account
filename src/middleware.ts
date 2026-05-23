import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimitMiddleware } from "@/middleware/rate-limit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimitResponse = await rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  if (!pathname.startsWith("/adm")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = token.role as string;
  
  if (userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/?unauthorized=1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/adm/:path*"],
};
