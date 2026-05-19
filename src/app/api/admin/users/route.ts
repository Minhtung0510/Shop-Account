import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        balance: true,
        rank: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      balance: user.balance,
      rank: user.rank,
      orders: user._count.orders,
      created: new Date(user.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
