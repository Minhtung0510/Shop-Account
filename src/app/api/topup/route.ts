import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const topups = await db.topupTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(topups);
  } catch (error) {
    console.error("Topup GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    let body: { amount?: number; bankCode?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const { amount, bankCode } = body;

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Số tiền nạp tối thiểu là 10,000đ" }, { status: 400 });
    }

    const transferContent = `NAPTIEN${session.user.id.slice(-6).toUpperCase()}`;

    const topup = await db.topupTransaction.create({
      data: {
        userId: session.user.id,
        amount: Number(amount),
        bankCode: bankCode || "TP Bank",
        transferContent,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      topup,
      transferContent,
      message: `Nạp ${amount.toLocaleString("vi-VN")}đ. Chuyển khoản với nội dung: ${transferContent}`,
    }, { status: 201 });
  } catch (error) {
    console.error("Topup POST error:", error);
    return NextResponse.json({ error: "Lỗi server khi tạo giao dịch nạp tiền" }, { status: 500 });
  }
}
