import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const warranties = await db.warranty.findMany({
      where,
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const count = await db.warranty.count({ where: { status: "PENDING" } });

    return NextResponse.json({ warranties, pendingCount: count });
  } catch (error) {
    console.error("Warranty GET error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chua dang nhap" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, orderType, productName, issue } = body;

    if (!orderId || !orderType || !productName || !issue) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const warranty = await db.warranty.create({
      data: {
        userId: session.user.id,
        orderId,
        orderType,
        productName,
        issue,
      },
    });

    return NextResponse.json({ success: true, warranty });
  } catch (error) {
    console.error("Warranty POST error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const warranty = await db.warranty.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });

    return NextResponse.json({ success: true, warranty });
  } catch (error) {
    console.error("Warranty PATCH error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
