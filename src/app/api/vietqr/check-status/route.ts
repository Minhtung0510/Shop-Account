import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/vietqr/check-status?topupId=xxx
 * Polls the status of a topup transaction.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topupId = searchParams.get("topupId");

    if (!topupId) {
      return NextResponse.json({ error: "Thiếu topupId" }, { status: 400 });
    }

    const topup = await db.topupTransaction.findUnique({
      where: { id: topupId },
    });

    if (!topup) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    if (topup.userId !== session.user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    return NextResponse.json({
      id: topup.id,
      status: topup.status,
      amount: topup.amount,
      verifiedAt: topup.verifiedAt,
    });
  } catch (error) {
    console.error("VietQR check-status error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
