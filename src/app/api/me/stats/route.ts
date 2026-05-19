import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const userId = session.user.id as string;

    const [balance, orderCount, totalSpent, lastOrder, topupTotal, lastTopup] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { balance: true } }),
      db.order.count({ where: { userId, status: { in: ["SUCCESS", "COMPLETED"] } } }),
      db.order.aggregate({
        where: { userId, status: { in: ["SUCCESS", "COMPLETED"] } },
        _sum: { totalAmount: true },
      }),
      db.order.findFirst({
        where: { userId, status: { in: ["SUCCESS", "COMPLETED"] } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      db.topupTransaction.aggregate({
        where: { userId, status: "APPROVED" },
        _sum: { amount: true },
      }),
      db.topupTransaction.findFirst({
        where: { userId, status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      balance: balance?.balance ?? 0,
      totalOrders: orderCount,
      totalSpent: totalSpent._sum.totalAmount ?? 0,
      topupTotal: topupTotal._sum.amount ?? 0,
      lastOrder: lastOrder?.createdAt ?? null,
      lastTopup: lastTopup?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Me stats error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
