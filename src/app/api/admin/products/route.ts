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
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const products = await db.product.findMany({
      include: {
        category: true,
        _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
      },
      orderBy: { createdAt: "desc" },
    });

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

    return NextResponse.json(synced);
  } catch (error) {
    console.error("Admin products API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const body = await req.json();
    const { name, description, price, originalPrice, categoryId, thumbnail, images, stock, badge, status } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || "",
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId,
        thumbnail: thumbnail || "",
        images: images || "",
        stock: 0,
        badge: badge || null,
        status: status || "ACTIVE",
      },
    });

    await db.category.update({
      where: { id: categoryId },
      data: { productCount: { increment: 1 } },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      entityType: "products",
      entityId: product.id,
      newValues: { name, price, categoryId },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });

    const body = await req.json();
    const { id, name, description, price, originalPrice, categoryId, thumbnail, images, stock, badge, status } = body;

    if (!id || !name || !price || !categoryId) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId,
        thumbnail: thumbnail || "",
        images: images || "",
        badge: badge || null,
        status: status || "ACTIVE",
      },
    });

    if (existing.categoryId !== categoryId) {
      await db.category.update({ where: { id: existing.categoryId }, data: { productCount: { decrement: 1 } } });
      await db.category.update({ where: { id: categoryId }, data: { productCount: { increment: 1 } } });
    }

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "products",
      entityId: id,
      oldValues: { name: existing.name, price: existing.price },
      newValues: { name, price, categoryId },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
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

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    await db.product.delete({ where: { id } });

    await db.category.update({
      where: { id: existing.categoryId },
      data: { productCount: { decrement: 1 } },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      entityType: "products",
      entityId: id,
      oldValues: { name: existing.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
