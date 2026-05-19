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

    const orders = await db.order.findMany({
      include: {
        user: { select: { username: true, email: true } },
        orderItems: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      product: order.orderItems.map((item) => item.product?.name).join(", ") || "N/A",
      price: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
