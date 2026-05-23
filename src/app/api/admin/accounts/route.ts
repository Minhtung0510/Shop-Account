import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function obfuscatePassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const accounts = await db.accountInventory.findMany({
      where,
      include: { 
        product: { select: { id: true, name: true, slug: true, stock: true } } 
      },
      orderBy: { createdAt: "desc" },
    });

    const securedAccounts = accounts.map(acc => ({
      ...acc,
      password: obfuscatePassword(acc.password),
    }));

    return NextResponse.json({ accounts: securedAccounts, total: accounts.length });
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { productId, account } = body;

    if (!productId || !account?.email || !account?.password) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const created = await db.accountInventory.create({
      data: {
        productId,
        email: account.email.trim(),
        password: account.password.trim(),
        status: account.status || "AVAILABLE",
      },
    });

    await db.product.update({
      where: { id: productId },
      data: { stock: { increment: 1 } },
    });

    return NextResponse.json({ success: true, account: created });
  } catch (error) {
    console.error("Accounts POST error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { id, email, password, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const existing = await db.accountInventory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    const updated = await db.accountInventory.update({
      where: { id },
      data: {
        email: email?.trim() || existing.email,
        password: password?.trim() || existing.password,
        status: status || existing.status,
      },
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (error) {
    console.error("Accounts PUT error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const account = await db.accountInventory.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    }

    if (account.status === "SOLD") {
      return NextResponse.json({ error: "Tài khoản đã bán, không thể xóa" }, { status: 400 });
    }

    await db.accountInventory.delete({ where: { id } });

    await db.product.update({
      where: { id: account.productId },
      data: { stock: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accounts DELETE error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
