import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchAndApproveTopup } from "@/lib/topup-auto";

export const dynamic = "force-dynamic";

type CassoV2Data = {
  id?: number;
  description?: string;
  amount?: number;
};

type CassoV2Payload = {
  error?: number;
  data?: CassoV2Data;
};

function verifyCassoToken(request: Request): boolean {
  const secret = process.env.CASSO_WEBHOOK_SECRET || process.env.BANKING_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[Casso webhook] CRITICAL: No webhook secret configured! Rejecting all requests.");
    return false;
  }

  const token =
    request.headers.get("secure-token") ||
    request.headers.get("x-casso-signature");
  return token === secret;
}

async function isDuplicate(provider: string, externalId: string): Promise<boolean> {
  try {
    await db.webhookLog.create({
      data: { provider, externalId },
    });
    return false;
  } catch {
    return true;
  }
}

/**
 * Casso webhook V2 — auto credit on incoming transfer.
 * Webhook URL: {SITE}/api/webhooks/casso
 */
export async function POST(request: Request) {
  try {
    if (!verifyCassoToken(request)) {
      return NextResponse.json({ error: 401 }, { status: 401 });
    }

    let body: CassoV2Payload & { data?: CassoV2Data | CassoV2Data[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 400 }, { status: 400 });
    }

    const rows = Array.isArray(body.data) ? body.data : body.data ? [body.data] : [];

    for (const row of rows) {
      const externalId = String(row.id ?? "");
      if (externalId && (await isDuplicate("casso", externalId))) {
        continue;
      }

      const amount = Number(row.amount);
      const content = row.description || "";
      if (!amount || amount <= 0) continue;

      const result = await matchAndApproveTopup({ content, amount });
      // LOG: Ghi nhận webhook, KHÔNG tự động duyệt - duyệt thủ công bởi admin
      if (result.ok) {
        console.log("[Casso webhook] Giao dịch nhận được:", {
          content,
          amount,
          status: "PENDING",
          message: "Admin cần duyệt thủ công trong trang admin"
        });
      } else {
        console.warn("[Casso webhook] Không khớp giao dịch:", result.reason, { content, amount });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Casso webhook] error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
