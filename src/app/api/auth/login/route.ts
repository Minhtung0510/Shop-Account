"use server";

import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";
import { RATE_LIMITS } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được trống"),
});

/**
 * Get remaining attempts info
 */
async function getRemainingAttempts(email: string): Promise<{
  attempts: number;
  maxAttempts: number;
}> {
  const user = await db.user.findUnique({
    where: { email },
    select: { failedLoginAttempts: true },
  });

  const attempts = user?.failedLoginAttempts || 0;
  return {
    attempts,
    maxAttempts: RATE_LIMITS.login.maxAttempts,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.message }, { status: 400 });
    }

    const { email, password } = validation.data;
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Check if account is locked BEFORE attempting login
    const userBeforeLogin = await db.user.findUnique({
      where: { email },
      select: {
        isLocked: true,
        lockUntil: true,
        lockedAt: true,
        failedLoginAttempts: true,
      },
    });

    if (userBeforeLogin?.isLocked && userBeforeLogin.lockUntil) {
      const lockExpiresAt = new Date(userBeforeLogin.lockUntil);
      const now = new Date();

      // If lock has expired, auto-unlock the account
      if (now >= lockExpiresAt) {
        await db.user.update({
          where: { email },
          data: {
            isLocked: false,
            lockedAt: null,
            lockUntil: null,
            failedLoginAttempts: 0,
          },
        });
      } else {
        // Account is still locked
        const remainingSeconds = Math.ceil(
          (lockExpiresAt.getTime() - now.getTime()) / 1000
        );
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        await createAuditLog({
          userId: undefined,
          action: "LOGIN_BLOCKED",
          entityType: "users",
          entityId: undefined,
          metadata: {
            ipAddress,
            userAgent,
            reason: "account_locked",
            lockExpiresAt: lockExpiresAt.toISOString(),
          },
        });

        return NextResponse.json(
          {
            error: `Tài khoản đã bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
            code: "ACCOUNT_LOCKED",
            lockExpiresAt: lockExpiresAt.toISOString(),
            retryAfterSeconds: remainingSeconds,
          },
          { status: 423 }
        );
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      // Log failed login attempt
      const failedUser = await db.user.findUnique({
        where: { email },
        select: { id: true, failedLoginAttempts: true, isLocked: true },
      });

      const attemptsInfo = await getRemainingAttempts(email);
      const remainingAttempts =
        attemptsInfo.maxAttempts - attemptsInfo.attempts - 1;

      await createAuditLog({
        userId: failedUser?.id || undefined,
        action: "LOGIN_FAILED",
        entityType: "users",
        entityId: failedUser?.id,
        metadata: {
          ipAddress,
          userAgent,
          reason: "invalid_credentials",
          attemptsUsed: attemptsInfo.attempts,
          attemptsRemaining: remainingAttempts,
          accountLocked: failedUser?.isLocked || false,
        },
      });

      // If account is now locked after this attempt
      if (failedUser?.isLocked) {
        return NextResponse.json(
          {
            error: `Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${RATE_LIMITS.login.lockoutDurationMs / 60000} phút.`,
            code: "ACCOUNT_LOCKED",
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          error: "Email hoặc mật khẩu không đúng",
          code: "INVALID_CREDENTIALS",
          attemptsRemaining: Math.max(0, remainingAttempts),
        },
        { status: 401 }
      );
    }

    // Get user ID after sign in
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (user) {
      // Reset failed login attempts on successful login
      await db.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          isLocked: false,
          lockedAt: null,
          lockUntil: null,
        },
      });

      await createAuditLog({
        userId: user.id,
        action: "LOGIN",
        entityType: "users",
        entityId: user.id,
        metadata: {
          ipAddress,
          userAgent,
          provider: "credentials",
          role: user.role,
        },
      });
    }

    // Check if user is admin to redirect to /adm
    const isAdminUser = user?.role === "ADMIN";
    const redirectUrl = isAdminUser ? "/adm" : "/";

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
