import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const [orders, serviceOrders] = await Promise.all([
      db.order.findMany({
        include: {
          user: { select: { username: true, email: true } },
          orderItems: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.serviceOrder.findMany({
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
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
      user: order.user,
    }));

    const formattedServiceOrders = serviceOrders.map((so) => ({
      id: so.id,
      type: "SERVICE",
      product: so.serviceIcon ? `${so.serviceIcon} ${so.serviceName}` : so.serviceName,
      price: so.servicePrice,
      status: so.status,
      date: new Date(so.createdAt).toLocaleDateString("vi-VN"),
      createdAt: so.createdAt.toISOString(),
      user: so.user,
    }));

    const all = [...formattedOrders, ...formattedServiceOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(all);
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, status } = body;

    if (!id || !type || !status) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    if (type === "PRODUCT") {
      await db.order.update({
        where: { id },
        data: { status },
      });
    } else if (type === "SERVICE") {
      await db.serviceOrder.update({
        where: { id },
        data: { status },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
