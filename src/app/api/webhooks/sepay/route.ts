import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchAndApproveTopup } from "@/lib/topup-auto";

export const dynamic = "force-dynamic";

type SepayPayload = {
  id?: number;
  content?: string;
  code?: string | null;
  transferAmount?: number;
  transferType?: string;
};

function verifySepayAuth(request: Request): boolean {
  const secret =
    process.env.SEPAY_WEBHOOK_API_KEY ||
    process.env.BANKING_WEBHOOK_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization") || "";
  const apiKey = auth.replace(/^Apikey\s+/i, "").trim();
  return apiKey === secret;
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
 * SePay webhook — auto credit balance when bank transfer arrives.
 * Configure at https://my.sepay.vn → Webhook URL: {SITE}/api/webhooks/sepay
 * Payment code prefix: NAPTIEN (Company settings → Payment code structure)
 */
export async function POST(request: Request) {
  try {
    if (!verifySepayAuth(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: SepayPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    if (body.transferType && body.transferType !== "in") {
      return NextResponse.json({ success: true });
    }

    const externalId = String(body.id ?? "");
    if (externalId && (await isDuplicate("sepay", externalId))) {
      return NextResponse.json({ success: true });
    }

    const amount = Number(body.transferAmount);
    const content = body.content || "";
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: true });
    }

    const result = await matchAndApproveTopup({
      content,
      code: body.code,
      amount,
    });

    // LOG: Ghi nhận webhook, KHÔNG tự động duyệt - duyệt thủ công bởi admin
    if (result.ok) {
      console.log("[SePay webhook] Giao dịch nhận được:", {
        content,
        amount,
        code: body.code,
        status: "PENDING",
        message: "Admin cần duyệt thủ công trong trang admin"
      });
    } else {
      console.warn("[SePay webhook] Không khớp giao dịch:", result.reason, { content, amount });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SePay webhook] error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
