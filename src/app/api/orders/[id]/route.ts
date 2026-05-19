import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
    }

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: { select: { name: true, thumbnail: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Khong tim thay don hang" }, { status: 404 });
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen truy cap" }, { status: 403 });
    }

    return NextResponse.json({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        accountData: item.accountData,
        product: item.product,
      })),
    });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
