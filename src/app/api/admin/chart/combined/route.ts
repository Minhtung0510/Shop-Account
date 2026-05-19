import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");

    const now = new Date();
    const year = now.getFullYear();
    const month = monthParam !== null ? parseInt(monthParam, 10) : now.getMonth();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = endOfMonth.getDate();
    const data = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day, 0, 0, 0);
      const dayEnd = new Date(year, month, day, 23, 59, 59);

      const [revenueResult, ordersCount] = await Promise.all([
        db.order.aggregate({
          where: {
            createdAt: { gte: dayStart, lte: dayEnd },
            status: "SUCCESS",
          },
          _sum: { totalAmount: true },
        }),
        db.order.count({
          where: { createdAt: { gte: dayStart, lte: dayEnd } },
        }),
      ]);

      data.push({
        date: `${day}`,
        revenue: revenueResult._sum.totalAmount || 0,
        orders: ordersCount,
      });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
