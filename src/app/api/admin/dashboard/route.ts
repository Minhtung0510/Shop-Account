import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";
import { getRecentAuditLogs } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalUsers,
      totalOrders,
      monthlyRevenue,
      todayOrders,
      recentOrders,
      orderStats,
      topUsers,
      recentLogs,
      lowStockProducts,
    ] = await Promise.all([
      db.user.count({ where: { role: "USER" } }),
      db.order.count(),
      db.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: "SUCCESS" },
        _sum: { totalAmount: true },
      }),
      db.order.count({ where: { createdAt: { gte: startOfToday } } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      Promise.all([
        db.order.count({ where: { status: "SUCCESS" } }),
        db.order.count({ where: { status: "PROCESSING" } }),
        db.order.count({ where: { status: "FAILED" } }),
        db.order.count({ where: { status: "PENDING" } }),
      ]),
      db.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          username: true,
          _count: { select: { orders: true } },
        },
        orderBy: { orders: { _count: "desc" } },
        take: 5,
      }),
      getRecentAuditLogs(10),
      db.product.count({ where: { stock: { lte: 5 } } }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalOrders,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        todayOrders,
        usersChange: 12,
        ordersChange: 8,
        revenueChange: 23,
        todayOrdersChange: 15,
        lowStockProducts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        user: o.user,
      })),
      orderStats: {
        success: orderStats[0],
        processing: orderStats[1],
        failed: orderStats[2],
        pending: orderStats[3],
      },
      topUsers: topUsers.map((u) => ({
        id: u.id,
        username: u.username,
        orderCount: u._count.orders,
      })),
      recentLogs: recentLogs.success ? recentLogs.data : [],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
