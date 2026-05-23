import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-auth";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET() {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const body = await req.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ error: "Tên danh mục là bắt buộc" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: icon || "",
        productCount: 0,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entityType: "categories",
      entityId: category.id,
      newValues: { name, slug },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const body = await req.json();
    const { id, name, icon } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name) {
      data.name = name;
      data.slug = slugify(name);
    }
    if (icon !== undefined) {
      data.icon = icon;
    }

    const category = await db.category.update({
      where: { id },
      data,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "categories",
      entityId: id,
      oldValues: { name: existing.name },
      newValues: { name, icon },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy danh mục" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Danh mục có ${existing._count.products} sản phẩm. Không thể xóa.` },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      entityType: "categories",
      entityId: id,
      oldValues: { name: existing.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
