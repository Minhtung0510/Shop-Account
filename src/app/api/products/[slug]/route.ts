import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const product = await db.product.findUnique({
        where: { slug },
        include: { category: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    return NextResponse.json({ error: "Thiếu slug" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
