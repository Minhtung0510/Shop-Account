/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse, brute force attacks, and DDoS
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  RATE_LIMITS,
  getClientIP,
  createRateLimitKey,
  checkRateLimit,
} from "@/lib/security";

/**
 * Rate limited API routes configuration
 */
const RATE_LIMITED_ROUTES = [
  {
    path: "/api/auth/login",
    limit: RATE_LIMITS.login.maxAttempts,
    windowMs: RATE_LIMITS.login.windowMs,
    identifier: "ip", // Use IP for login attempts
  },
  {
    path: "/api/auth/register",
    limit: RATE_LIMITS.register.maxAttempts,
    windowMs: RATE_LIMITS.register.windowMs,
    identifier: "ip",
  },
  {
    path: "/api/checkout",
    limit: RATE_LIMITS.checkout.maxAttempts,
    windowMs: RATE_LIMITS.checkout.windowMs,
    identifier: "user", // Use user ID if authenticated
  },
];

const GENERAL_API_LIMIT = RATE_LIMITS.api.maxRequests;
const GENERAL_API_WINDOW = RATE_LIMITS.api.windowMs;

/**
 * Create rate limit response headers
 */
function createRateLimitHeaders(resetAt: number, remaining: number, limit: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
    "X-RateLimit-Reset": Math.ceil(resetAt / 1000).toString(),
    "Retry-After": retryAfter.toString(),
  };
}

/**
 * Check if user is authenticated and get their ID
 */
async function getUserId(request: NextRequest): Promise<string | null> {
  // Import auth here to avoid circular dependencies
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get identifier for rate limiting
 */
async function getIdentifier(request: NextRequest, routeConfig: { identifier: string }): Promise<string> {
  const ip = getClientIP(request.headers);

  if (routeConfig.identifier === "user") {
    const userId = await getUserId(request);
    if (userId) {
      return `user:${userId}`;
    }
    // Fall back to IP for unauthenticated users
  }

  return `ip:${ip}`;
}

/**
 * Check rate limit for a specific route
 */
async function checkRouteRateLimit(
  request: NextRequest,
  route: typeof RATE_LIMITED_ROUTES[0]
): Promise<{ allowed: boolean; headers: Record<string, string>; limit: number }> {
  const identifier = await getIdentifier(request, route);
  const key = createRateLimitKey(route.path, identifier);

  const result = checkRateLimit(key, route.limit, route.windowMs);

  return {
    allowed: result.allowed,
    headers: createRateLimitHeaders(result.resetAt, result.remaining, route.limit),
    limit: route.limit,
  };
}

/**
 * General API rate limiter (applies to all /api/* routes)
 */
async function checkGeneralRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
}> {
  const ip = getClientIP(request.headers);
  const key = createRateLimitKey("general", ip);

  const result = checkRateLimit(key, GENERAL_API_LIMIT, GENERAL_API_WINDOW);

  return {
    allowed: result.allowed,
    headers: createRateLimitHeaders(result.resetAt, result.remaining, GENERAL_API_LIMIT),
  };
}

/**
 * Rate limiting middleware for API routes
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return null;
  }

  // Skip rate limiting for webhook callbacks (they have their own verification)
  if (pathname.includes("/webhook")) {
    return null;
  }

  // Skip rate limiting for health checks
  if (pathname === "/api/health" || pathname === "/api/ping") {
    return null;
  }

  // Check specific route limits first
  for (const route of RATE_LIMITED_ROUTES) {
    if (pathname === route.path) {
      const result = await checkRouteRateLimit(request, route);

      // Apply headers to all responses
      const response = NextResponse.next();
      Object.entries(result.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      if (!result.allowed) {
        return NextResponse.json(
          {
            error: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: result.headers["Retry-After"],
          },
          {
            status: 429,
            headers: result.headers,
          }
        );
      }

      return response;
    }
  }

  // Apply general rate limit to all other API routes
  const generalResult = await checkGeneralRateLimit(request);

  const response = NextResponse.next();
  Object.entries(generalResult.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (!generalResult.allowed) {
    return NextResponse.json(
      {
        error: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: generalResult.headers["Retry-After"],
      },
      {
        status: 429,
        headers: generalResult.headers,
      }
    );
  }

  return response;
}

/**
 * Get rate limit status for a specific endpoint
 */
export async function getRateLimitStatus(
  request: NextRequest,
  endpoint: string
): Promise<{
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}> {
  const ip = getClientIP(request.headers);
  const identifier = await getIdentifier(request, { identifier: "ip" });
  const key = createRateLimitKey(endpoint, identifier);

  // Find matching route config
  const routeConfig = RATE_LIMITED_ROUTES.find((r) => r.path === endpoint);
  const limit = routeConfig?.limit || GENERAL_API_LIMIT;
  const windowMs = routeConfig?.windowMs || GENERAL_API_WINDOW;

  const result = checkRateLimit(key, limit, windowMs);

  return {
    limit,
    remaining: result.remaining,
    reset: Math.ceil(result.resetAt / 1000),
    used: limit - result.remaining,
  };
}

/**
 * Track failed login attempt in database
 */
export async function trackFailedLoginAttempt(email: string): Promise<void> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, failedLoginAttempts: true },
    });

    if (user) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const shouldLock = attempts >= RATE_LIMITS.login.maxAttempts;

      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          isLocked: shouldLock,
          lockedAt: shouldLock ? new Date() : undefined,
        },
      });
    }
  } catch (error) {
    console.error("[RateLimit] Failed to track login attempt:", error);
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLoginAttempts(email: string): Promise<void> {
  try {
    await db.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        isLocked: false,
        lockedAt: null,
      },
    });
  } catch (error) {
    console.error("[RateLimit] Failed to reset login attempts:", error);
  }
}

/**
 * Check if account is locked and get lockout info
 */
export async function checkAccountLockout(email: string): Promise<{
  isLocked: boolean;
  lockedUntil: Date | null;
  attemptsRemaining: number;
}> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        isLocked: true,
        lockedAt: true,
        failedLoginAttempts: true,
      },
    });

    if (!user) {
      return {
        isLocked: false,
        lockedUntil: null,
        attemptsRemaining: RATE_LIMITS.login.maxAttempts,
      };
    }

    // Calculate if lockout period has expired
    let lockedUntil: Date | null = null;
    if (user.isLocked && user.lockedAt) {
      lockedUntil = new Date(
        user.lockedAt.getTime() + RATE_LIMITS.login.lockoutDurationMs
      );

      // If lockout period has expired, auto-unlock
      if (lockedUntil < new Date()) {
        await db.user.update({
          where: { email },
          data: {
            isLocked: false,
            lockedAt: null,
            failedLoginAttempts: 0,
          },
        });

        return {
          isLocked: false,
          lockedUntil: null,
          attemptsRemaining: RATE_LIMITS.login.maxAttempts,
        };
      }
    }

    return {
      isLocked: user.isLocked,
      lockedUntil,
      attemptsRemaining: Math.max(
        0,
        RATE_LIMITS.login.maxAttempts - (user.failedLoginAttempts || 0)
      ),
    };
  } catch (error) {
    console.error("[RateLimit] Failed to check account lockout:", error);
    return {
      isLocked: false,
      lockedUntil: null,
      attemptsRemaining: RATE_LIMITS.login.maxAttempts,
    };
  }
}
