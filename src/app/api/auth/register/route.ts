import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10,11}$/),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email, tên đăng nhập hoặc số điện thoại đã tồn tại" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        email: data.email,
        username: data.username,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { success: true, message: "Đăng ký thành công", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
