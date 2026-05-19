import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const topups = await db.topupTransaction.findMany({
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const formatted = topups.map((t) => ({
      id: t.id,
      userId: t.userId,
      username: t.user.username,
      email: t.user.email,
      amount: t.amount,
      bankCode: t.bankCode,
      transferContent: t.transferContent,
      status: t.status,
      verifiedAt: t.verifiedAt?.toISOString() || null,
      createdAt: t.createdAt.toISOString().split("T")[0],
      createdFull: t.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Admin topup GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const topup = await db.topupTransaction.findUnique({ where: { id } });
    if (!topup) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu nạp tiền" }, { status: 404 });
    }

    if (topup.status !== "PENDING") {
      return NextResponse.json({ error: "Yêu cầu đã được xử lý trước đó" }, { status: 400 });
    }

    if (action === "approve") {
      await db.$transaction([
        db.topupTransaction.update({
          where: { id },
          data: { status: "APPROVED", verifiedAt: new Date() },
        }),
        db.user.update({
          where: { id: topup.userId },
          data: { balance: { increment: topup.amount } },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Đã cộng ${topup.amount.toLocaleString("vi-VN")}đ vào tài khoản ${topup.userId}` });
    }

    if (action === "reject") {
      await db.topupTransaction.update({
        where: { id },
        data: { status: "REJECTED", verifiedAt: new Date() },
      });

      return NextResponse.json({ success: true, message: "Đã từ chối yêu cầu nạp tiền" });
    }

    return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error("Admin topup PUT error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
