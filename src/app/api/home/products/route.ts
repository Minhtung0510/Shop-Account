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
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const synced = products.map((p) => {
      let parsedImages: string[] = [];
      try {
        parsedImages = JSON.parse(p.images || "[]");
      } catch {
        parsedImages = p.images ? [p.images] : [];
      }
      return {
        ...p,
        images: parsedImages,
        stock: p._count.accountInventory,
      };
    });

    return NextResponse.json({ products: synced, categories, services }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error) {
    console.error("Home Products API error:", error);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu", products: [], categories: [], services: [] },
      { status: 500 }
    );
  }
}
