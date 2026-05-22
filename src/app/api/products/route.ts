import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search };
    }

    if (category) {
      where.category = { slug: category };
    }

    const orderBy: Record<string, string>[] = [];
    switch (sort) {
      case "price_low":
        orderBy.push({ price: "asc" });
        break;
      case "price_high":
        orderBy.push({ price: "desc" });
        break;
      case "best_selling":
        orderBy.push({ sold: "desc" });
        break;
      default:
        orderBy.push({ createdAt: "desc" });
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
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

    return NextResponse.json({
      items: synced,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách sản phẩm", items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
      { status: 500 }
    );
  }
}
