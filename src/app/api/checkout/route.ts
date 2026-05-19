import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getSMTPTransporter } from "@/lib/email";

export const dynamic = "force-dynamic";

function fmt(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

async function sendEmail(to: string, subject: string, html: string) {
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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, balance: true, username: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 401 });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Một số sản phẩm không tồn tại" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items as { productId: string; quantity?: number }[]) {
      const product = products.find((p: { id: string }) => p.id === item.productId)!;
      const quantity = item.quantity || 1;
      totalAmount += product.price * quantity;

      if (quantity > product.stock) {
        return NextResponse.json(
          { error: `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho` },
          { status: 400 }
        );
      }

      orderItemsData.push({ productId: product.id, quantity, price: product.price });
    }

    if (user.balance < totalAmount) {
      return NextResponse.json(
        { error: "Số dư không đủ", required: totalAmount, current: user.balance },
        { status: 402 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await db.$transaction(async (tx: any) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          status: "SUCCESS",
          paymentMethod: "BALANCE",
          orderItems: { create: orderItemsData },
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: totalAmount } },
      });

      await Promise.all(
        orderItemsData.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              sold: { increment: item.quantity },
            },
          })
        )
      );

      return newOrder;
    });

    const newBalance = user.balance - totalAmount;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (ADMIN_EMAIL) {
      const orderItemsHtml = orderItemsData
        .map((item) => {
          const product = products.find((p: { id: string; name: string }) => p.id === item.productId)!;
          return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${item.price.toLocaleString("vi-VN")} VND</td>
            </tr>
          `;
        })
        .join("");

      sendEmail(
        ADMIN_EMAIL,
        `[Don Hang] ${user.username} - ${fmt(totalAmount)}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
              <h2 style="color: #3B82F6; margin-bottom: 20px;">Don hang moi tu Shop Account</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Khach hang</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.username} (${user.email})</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Ma don</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tong tien</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${fmt(totalAmount)}</td>
                </tr>
                ${orderItemsHtml}
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Thoi gian</td>
                  <td style="padding: 10px;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                </tr>
              </table>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">Tu dong gui tu Shop Account</p>
            </div>
          </div>
        `
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Thanh toán thành công",
      newBalance,
      totalAmount,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Lỗi server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
