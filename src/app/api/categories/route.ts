import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ error: "Thiếu tên danh mục" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Danh mục đã tồn tại" }, { status: 409 });
    }

    const category = await db.category.create({
      data: { name, slug, icon: icon || "" },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, icon } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    const category = await db.category.update({
      where: { id },
      data: { name, slug, icon: icon ?? existing.icon },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Categories PUT error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const category = await db.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    const productCount = await db.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Danh mục đang có ${productCount} sản phẩm. Xóa sản phẩm trước.` },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Categories DELETE error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
