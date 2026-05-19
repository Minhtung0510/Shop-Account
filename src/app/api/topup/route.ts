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

    const { amount, bankCode } = await request.json();

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Số tiền nạp tối thiểu là 10,000đ" }, { status: 400 });
    }

    const transferContent = `NM${session.user.id.slice(-6)}${Date.now().toString().slice(-6)}`;

    const topup = await db.topupTransaction.create({
      data: {
        userId: session.user.id,
        amount: Number(amount),
        bankCode: bankCode || "VietinBank",
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
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
