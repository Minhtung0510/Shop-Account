import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/me — lay thong tin user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        balance: true,
        rank: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Me GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT /api/me — cap nhat thong tin user
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { username, phone } = body;

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: "Tên phải có ít nhất 2 ký tự" }, { status: 400 });
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    // Check username trung
    if (username !== session.user.name) {
      const existing = await db.user.findUnique({ where: { username } });
      if (existing && existing.id !== (session.user.id as string)) {
        return NextResponse.json({ error: "Tên đăng nhập đã được sử dụng" }, { status: 409 });
      }
    }

    // Check phone trung
    if (phone) {
      const existingPhone = await db.user.findUnique({ where: { phone } });
      if (existingPhone && existingPhone.id !== (session.user.id as string)) {
        return NextResponse.json({ error: "Số điện thoại đã được sử dụng" }, { status: 409 });
      }
    }

    const updated = await db.user.update({
      where: { id: session.user.id as string },
      data: {
        username: username.trim(),
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        balance: true,
        rank: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Me PUT error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
