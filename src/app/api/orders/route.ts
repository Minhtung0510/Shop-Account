import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const [orders, serviceOrders] = await Promise.all([
      db.order.findMany({
        where: { userId: session.user.id },
        include: { orderItems: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
      db.serviceOrder.findMany({
        where: { id: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      type: "PRODUCT",
      product: order.orderItems.map((item) => item.product?.name).join(", ") || "N/A",
      price: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
      createdAt: order.createdAt.toISOString(),
    }));

    const formattedServiceOrders = serviceOrders.map((so) => ({
      id: so.id,
      type: "SERVICE",
      product: so.serviceIcon ? `${so.serviceIcon} ${so.serviceName}` : so.serviceName,
      price: so.servicePrice,
      status: so.status,
      date: new Date(so.createdAt).toLocaleDateString("vi-VN"),
      createdAt: so.createdAt.toISOString(),
    }));

    const all = [...formattedOrders, ...formattedServiceOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(all);
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
