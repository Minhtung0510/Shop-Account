import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Thiếu mật khẩu" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id as string },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
    }

    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.user.id as string },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
