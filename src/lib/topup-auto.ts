import { db } from "@/lib/db";
import { parseTopupCodeFromText } from "@/lib/vietqr";

export type AutoTopupResult =
  | { ok: true; topupId: string; userId: string; amount: number; alreadyProcessed?: boolean }
  | { ok: false; reason: string };

/**
 * Approve a pending topup and credit user balance (idempotent if already APPROVED).
 */
export async function approveTopupById(topupId: string): Promise<AutoTopupResult> {
  const topup = await db.topupTransaction.findUnique({ where: { id: topupId } });
  if (!topup) {
    return { ok: false, reason: "Không tìm thấy giao dịch nạp tiền" };
  }

  if (topup.status === "APPROVED") {
    return {
      ok: true,
      topupId: topup.id,
      userId: topup.userId,
      amount: topup.amount,
      alreadyProcessed: true,
    };
  }

  if (topup.status !== "PENDING") {
    return { ok: false, reason: `Giao dịch đã ${topup.status}` };
  }

  await db.$transaction([
    db.topupTransaction.update({
      where: { id: topupId },
      data: { status: "APPROVED", verifiedAt: new Date() },
    }),
    db.user.update({
      where: { id: topup.userId },
      data: { balance: { increment: topup.amount } },
    }),
  ]);

  return {
    ok: true,
    topupId: topup.id,
    userId: topup.userId,
    amount: topup.amount,
  };
}

/**
 * Match incoming bank transfer to a pending topup by memo + amount.
 */
export async function matchAndApproveTopup(params: {
  content: string;
  code?: string | null;
  amount: number;
}): Promise<AutoTopupResult> {
  const { content, code, amount } = params;
  const paymentCode =
    (code && code.toUpperCase().startsWith("NAPTIEN") ? code.toUpperCase() : null) ||
    parseTopupCodeFromText(content);

  if (!paymentCode) {
    return { ok: false, reason: "Không có mã NAPTIEN trong nội dung CK" };
  }

  const topup = await db.topupTransaction.findFirst({
    where: {
      transferContent: paymentCode,
      status: "PENDING",
    },
  });

  if (!topup) {
    const approved = await db.topupTransaction.findFirst({
      where: { transferContent: paymentCode, status: "APPROVED" },
    });
    if (approved) {
      return {
        ok: true,
        topupId: approved.id,
        userId: approved.userId,
        amount: approved.amount,
        alreadyProcessed: true,
      };
    }
    return { ok: false, reason: "Không tìm thấy yêu cầu nạp tiền đang chờ" };
  }

  if (Math.round(topup.amount) !== Math.round(amount)) {
    return {
      ok: false,
      reason: `Số tiền không khớp (cần ${topup.amount}, nhận ${amount})`,
    };
  }

  return approveTopupById(topup.id);
}
