import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildTopupTransferContent, buildVietQrImageUrl } from "@/lib/vietqr";

export const dynamic = "force-dynamic";

/**
 * POST /api/vietqr/generate
 * Creates a TopupTransaction and returns VietQR image URL + transfer content.
 */
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

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Số tiền tối thiểu là 1,000đ" }, { status: 400 });
    }

    const existingPending = await db.topupTransaction.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    let topup;
    if (existingPending && existingPending.amount === Number(amount)) {
      topup = existingPending;
    } else {
      if (existingPending) {
        await db.topupTransaction.update({
          where: { id: existingPending.id },
          data: { status: "CANCELLED" },
        });
      }

      topup = await db.topupTransaction.create({
        data: {
          userId: session.user.id,
          amount: Number(amount),
          bankCode: bankCode || "TP Bank",
          transferContent: "TEMP",
          status: "PENDING",
        },
      });

      const transferContent = buildTopupTransferContent(topup.id);
      topup = await db.topupTransaction.update({
        where: { id: topup.id },
        data: { transferContent },
      });
    }

    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const bin = settingsMap["bank_bin"] || "970423";
    const acc = settingsMap["bank_account_number"] || "07553046301";
    const accName = settingsMap["bank_account_name"] || "NGUYEN MINH TUNG";

    const transferContent = topup.transferContent;
    const qrImageUrl = buildVietQrImageUrl({
      bin,
      accountNumber: acc,
      accountName: accName,
      amount: Number(amount),
      transferContent,
    });

    return NextResponse.json(
      {
        success: true,
        topupId: topup.id,
        amount,
        transferContent,
        qrImageUrl,
        qrDataURL: qrImageUrl,
        bank: {
          name: settingsMap["bank_name"] || "TP Bank",
          bin,
          accountNumber: acc,
          accountName: accName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("VietQR generate error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
