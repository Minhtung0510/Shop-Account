import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const monthParam = searchParams.get("month");

    const now = new Date();
    const year = now.getFullYear();
    const data: { label: string; revenue: number }[] = [];

    if (period === "day") {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const result = await db.order.aggregate({
        where: { createdAt: { gte: dayStart, lte: dayEnd }, status: "SUCCESS" },
        _sum: { totalAmount: true },
      });

      data.push({
        label: now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" }),
        revenue: result._sum.totalAmount || 0,
      });
    } else if (period === "week") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

        const result = await db.order.aggregate({
          where: { createdAt: { gte: dayStart, lte: dayEnd }, status: "SUCCESS" },
          _sum: { totalAmount: true },
        });

        data.push({
          label: d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
          revenue: result._sum.totalAmount || 0,
        });
      }
    } else if (period === "month") {
      const month = monthParam !== null ? parseInt(monthParam, 10) : now.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = endOfMonth.getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month, day, 0, 0, 0);
        const dayEnd = new Date(year, month, day, 23, 59, 59);

        const result = await db.order.aggregate({
          where: { createdAt: { gte: dayStart, lte: dayEnd }, status: "SUCCESS" },
          _sum: { totalAmount: true },
        });

        data.push({ label: `${day}`, revenue: result._sum.totalAmount || 0 });
      }
    } else if (period === "year") {
      for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);

        const result = await db.order.aggregate({
          where: { createdAt: { gte: startOfMonth, lte: endOfMonth }, status: "SUCCESS" },
          _sum: { totalAmount: true },
        });

        data.push({
          label: new Date(year, month).toLocaleDateString("vi-VN", { month: "short" }),
          revenue: result._sum.totalAmount || 0,
        });
      }
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
