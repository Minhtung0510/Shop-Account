import { NextResponse } from "next/server";
import { getMockSession } from "@/lib/mock-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getMockSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    return NextResponse.json({ message: "Topup transactions - demo mode" });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getMockSession();
    if (!session) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { amount, bankCode } = await request.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Số tiền nạp tối thiểu là 10,000đ" }, { status: 400 });
    }

    return NextResponse.json({ message: "Topup created - demo mode", amount, bankCode }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
