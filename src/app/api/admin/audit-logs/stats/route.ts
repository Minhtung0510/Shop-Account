import { NextResponse } from "next/server";
import { getAuditStats } from "@/lib/audit";
import { requireAdmin } from "@/lib/require-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check authorization
    const authResult = await requireAdmin();
    if (!authResult.authorized) return authResult.response;
    
    const result = await getAuditStats();

    if (!result.success) {
      return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to get audit stats:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thống kê" }, { status: 500 });
  }
}
