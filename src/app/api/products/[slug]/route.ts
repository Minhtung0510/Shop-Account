import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Khong tim thay san pham" }, { status: 404 });
    }

    let parsedImages: string[] = [];
    try {
      parsedImages = JSON.parse(product.images || "[]");
    } catch {
      parsedImages = product.images ? [product.images] : [];
    }

    return NextResponse.json({
      ...product,
      images: parsedImages,
      stock: product._count.accountInventory
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
