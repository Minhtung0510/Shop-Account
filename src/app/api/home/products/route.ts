import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (category) {
      where.category = { slug: category };
    }

    const [products, categories, services] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
        },
        orderBy: { sold: "desc" },
        take: limit,
      }),
      db.category.findMany({
        orderBy: { productCount: "desc" },
        take: 10,
      }),
      db.service.findMany({
        where: { status: "ACTIVE" },
        take: 6,
      }),
    ]);

    const synced = products.map((p) => ({ ...p, stock: p._count.accountInventory }));

    return NextResponse.json({ products: synced, categories, services });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
