import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const COMPLETED_STATUSES = ["SUCCESS", "COMPLETED", "FAILED", "REFUNDED"];

    const [orderCount, serviceOrderCount, warrantyCount] = await Promise.all([
      db.order.count({
        where: { status: { notIn: COMPLETED_STATUSES } },
      }),
      db.serviceOrder.count({
        where: { status: { notIn: COMPLETED_STATUSES } },
      }),
      db.warranty.count({
        where: { status: "PENDING" },
      }),
    ]);

    return NextResponse.json({
      serviceCount: serviceOrderCount,
      warrantyCount,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
