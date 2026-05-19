import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function syncStock(tx: Parameters<Parameters<typeof db.$transaction>[0]>[0], productId: string) {
  const count = await tx.accountInventory.count({
    where: { productId, status: "AVAILABLE" },
  });
  await tx.product.update({
    where: { id: productId },
    data: { stock: count },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const where = productId ? { productId } : {};
    const accounts = await db.accountInventory.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const body = await req.json();
    const { productId, accounts } = body;

    if (!productId || !accounts || !Array.isArray(accounts) || accounts.length === 0) {
      return NextResponse.json({ error: "Thieu thong tin" }, { status: 400 });
    }

    const created = await db.accountInventory.createMany({
      data: accounts.map((acc: { email: string; password: string }) => ({
        productId,
        email: acc.email,
        password: acc.password,
        status: "AVAILABLE",
      })),
    });

    await db.product.update({
      where: { id: productId },
      data: { stock: { increment: accounts.length } },
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error("Accounts POST error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Khong co quyen" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thieu ID" }, { status: 400 });
    }

    const account = await db.accountInventory.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ error: "Khong tim thay" }, { status: 404 });
    }

    if (account.status === "SOLD") {
      return NextResponse.json({ error: "Tai khoan da ban, khong the xoa" }, { status: 400 });
    }

    await db.accountInventory.delete({ where: { id } });

    await db.product.update({
      where: { id: account.productId },
      data: { stock: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accounts DELETE error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
