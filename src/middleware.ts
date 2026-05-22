import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROLE_LEVELS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MODERATOR: 3,
  STAFF: 4,
  USER: 5,
};

const ROUTE_REQUIREMENTS: Record<string, { minLevel: number }> = {
  "/adm": { minLevel: 4 },
  "/adm/san-pham": { minLevel: 2 },
  "/adm/danh-muc": { minLevel: 2 },
  "/adm/don-hang": { minLevel: 3 },
  "/adm/bao-hanh": { minLevel: 3 },
  "/adm/dich-vu": { minLevel: 2 },
  "/adm/nguoi-dung": { minLevel: 2 },
  "/adm/nap-tien": { minLevel: 2 },
  "/adm/cai-dat": { minLevel: 2 },
  "/adm/roles": { minLevel: 1 },
  "/adm/nhat-ky": { minLevel: 2 },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/adm")) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = (token.role as string) || "USER";
  const userLevel = ROLE_LEVELS[userRole] || 5;

  for (const [route, config] of Object.entries(ROUTE_REQUIREMENTS)) {
    if (pathname.startsWith(route)) {
      if (userLevel > config.minLevel) {
        return NextResponse.redirect(new URL("/?unauthorized=1", request.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/adm/:path*"],
};
