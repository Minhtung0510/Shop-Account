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
        include: { category: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      items: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
