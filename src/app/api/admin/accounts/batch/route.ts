import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { productId, accounts } = body;

    if (!productId || !accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const validAccounts = accounts.filter(
      (acc: { email: string; password: string }) => 
        acc.email && acc.password && acc.email.trim() && acc.password.trim()
    );

    if (validAccounts.length === 0) {
      return NextResponse.json({ error: "Không có tài khoản hợp lệ" }, { status: 400 });
    }

    const created = await db.accountInventory.createMany({
      data: validAccounts.map((acc: { email: string; password: string }) => ({
        productId,
        email: acc.email.trim(),
        password: acc.password.trim(),
        status: "AVAILABLE",
      })),
    });

    await db.product.update({
      where: { id: productId },
      data: { stock: { increment: validAccounts.length } },
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error("Batch accounts error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
