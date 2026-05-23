"use server";

import { NextResponse } from "next/server";
import { signOut } from "@/auth";
import { createAuditLog } from "@/lib/audit";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth();
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    if (session?.user?.id) {
      await createAuditLog({
        userId: session.user.id,
        action: "LOGOUT",
        entityType: "users",
        entityId: session.user.id,
        metadata: {
          ipAddress,
          userAgent,
        },
      });
    }

    await signOut({ redirect: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
