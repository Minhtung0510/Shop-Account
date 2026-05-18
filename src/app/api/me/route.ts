import { NextResponse } from "next/server";
import { getMockSession } from "@/lib/mock-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getMockSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({
      id: session.id,
      name: session.name,
      email: session.email,
      balance: session.balance,
      rank: session.rank,
      role: session.role,
    });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
