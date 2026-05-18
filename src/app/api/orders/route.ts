import { NextResponse } from "next/server";
import { getMockSession } from "@/lib/mock-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getMockSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({ message: "Orders endpoint - demo mode" });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getMockSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({ message: "Checkout endpoint - demo mode" });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
