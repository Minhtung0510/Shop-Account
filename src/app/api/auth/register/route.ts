import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";
import { PASSWORD_POLICY, validatePassword } from "@/lib/security";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(30, "Tên đăng nhập không được quá 30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"),
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số"),
  password: z
    .string()
    .min(PASSWORD_POLICY.minLength, `Mật khẩu phải có ít nhất ${PASSWORD_POLICY.minLength} ký tự`)
    .max(PASSWORD_POLICY.maxLength, `Mật khẩu không được quá ${PASSWORD_POLICY.maxLength} ký tự`),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: "Mật khẩu không đủ mạnh",
          code: "WEAK_PASSWORD",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      // Determine which field is duplicated for better UX
      let existingFields: string[] = [];
      if (existingUser.email === data.email) existingFields.push("Email");
      if (existingUser.username === data.username) existingFields.push("tên đăng nhập");
      if (existingUser.phone === data.phone) existingFields.push("số điện thoại");

      return NextResponse.json(
        {
          error: `${existingFields.join(", ")} đã tồn tại`,
          code: "USER_EXISTS",
        },
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
      // Filter out password validation errors from Zod
      const nonPasswordErrors = error.errors.filter(
        (err) => !err.path.includes("password")
      );

      if (nonPasswordErrors.length > 0) {
        return NextResponse.json(
          { error: "Dữ liệu không hợp lệ", details: nonPasswordErrors },
          { status: 400 }
        );
      }
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
