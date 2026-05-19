import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const services = await db.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Admin services API error:", error);
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
    const { name, icon, description, price, category, status } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const service = await db.service.create({
      data: {
        name,
        slug,
        icon: icon || "",
        description: description || "",
        price: parseFloat(price),
        category,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Create service error:", error);
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
    const { id, name, icon, description, price, category, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Thiếu ID" }, { status: 400 });
    }

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy dịch vụ" }, { status: 404 });
    }

    const service = await db.service.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        icon: icon ?? existing.icon,
        description: description ?? existing.description,
        price: price !== undefined ? parseFloat(price) : existing.price,
        category: category ?? existing.category,
        status: status ?? existing.status,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Update service error:", error);
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

    await db.service.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
