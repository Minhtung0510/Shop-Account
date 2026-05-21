import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildVietQrImageUrl } from "@/lib/vietqr";

export const dynamic = "force-dynamic";

function fmt(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function sendEmailFn(to: string, subject: string, html: string) {
  if (!to || !subject || !html) return;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || "Shop Account <noreply@resend.dev>",
          to: [to],
          subject,
          html,
        }),
      });
    } catch (e) {
      console.error("[Email/Resend]", e);
    }
    return;
  }

  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { email: process.env.FROM_EMAIL || "noreply@shopaccount.com" },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
    } catch (e) {
      console.error("[Email/Brevo]", e);
    }
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const t = getSMTPTransporter();
      await t.sendMail({
        from: `"Shop Account" <${process.env.FROM_EMAIL || "noreply@shopaccount.com"}>`,
        to,
        subject,
        html,
      });
    } catch (e) {
      console.error("[Email/SMTP]", e);
    }
    return;
  }

  console.log("=== EMAIL ===");
  console.log("To:", to, "| Subject:", subject);
}

/**
 * POST /api/orders/qr-payment
 * Creates a PENDING order with QR payment content.
 * Body: { items: [{ productId, quantity }] }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }

    const products = await db.product.findMany({
      where: { id: { in: items.map((i: { productId: string }) => i.productId) } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        thumbnail: true,
        _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
      },
    });

    if (products.length !== items.map((i: { productId: string }) => i.productId).length) {
      return NextResponse.json({ error: "Một số sản phẩm không tồn tại" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number; productName: string }[] = [];

    for (const item of items as { productId: string; quantity?: number }[]) {
      const product = products.find((p) => p.id === item.productId)!;
      const quantity = item.quantity || 1;
      const availableStock = product._count.accountInventory;

      if (quantity > availableStock) {
        return NextResponse.json(
          { error: `Sản phẩm "${product.name}" chỉ còn ${availableStock} trong kho` },
          { status: 400 }
        );
      }

      totalAmount += product.price * quantity;
      orderItemsData.push({ productId: product.id, quantity, price: product.price, productName: product.name });
    }

    const transferContent = `MUA${session.user.id.slice(-6).toUpperCase()}${Date.now().toString().slice(-4)}`;

    const order = await db.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: "PENDING",
        paymentMethod: "VIETQR",
        orderItems: { create: orderItemsData },
      },
    });

    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const bin = settingsMap["bank_bin"] || "970423";
    const acc = settingsMap["bank_account_number"] || "07553046301";
    const accName = settingsMap["bank_account_name"] || "NGUYEN MINH TUNG";

    const qrImageUrl = buildVietQrImageUrl({
      bin,
      accountNumber: acc,
      accountName: accName,
      amount: totalAmount,
      transferContent,
    });

    await db.order.update({
      where: { id: order.id },
      data: { transactionId: transferContent },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalAmount,
      transferContent,
      qrImageUrl,
      qrDataURL: qrImageUrl,
      bank: {
        name: settingsMap["bank_name"] || "TP Bank",
        bin,
        accountNumber: acc,
        accountName: accName,
      },
      items: orderItemsData,
    }, { status: 201 });
  } catch (error) {
    console.error("Order QR payment error:", error);
    const message = error instanceof Error ? error.message : "Lỗi server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
