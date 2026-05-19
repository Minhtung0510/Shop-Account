import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      balance: session.user.balance,
      rank: session.user.rank,
      role: session.user.role,
    });
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
