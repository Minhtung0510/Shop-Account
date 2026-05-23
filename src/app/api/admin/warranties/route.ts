import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

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
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { orderId, orderType, productName, issue } = body;

    if (!orderId || !orderType || !productName || !issue) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const warranty = await db.warranty.create({
      data: {
        userId: req.headers.get("x-user-id") || "",
        orderId,
        orderType,
        productName,
        issue,
      },
    });

    return NextResponse.json({ success: true, warranty });
  } catch (error) {
    console.error("Warranty POST error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const warranty = await db.warranty.update({
      where: { id },
      data: { status, adminNote: adminNote || null },
    });

    return NextResponse.json({ success: true, warranty });
  } catch (error) {
    console.error("Warranty PATCH error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
