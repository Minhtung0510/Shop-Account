import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSMTPTransporter } from "@/lib/email";

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
 * GET /api/orders/qr-status?orderId=xxx
 * Polls the status of an order for QR payment.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: { select: { name: true, thumbnail: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      orderItems: order.orderItems,
    });
  } catch (error) {
    console.error("QR order status error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

/**
 * POST /api/orders/qr-status
 * Manually confirm/callback for QR payment (admin or user can call this).
 * Body: { orderId }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    let body: { orderId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const { orderId } = body;
    if (!orderId) {
      return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { select: { productId: true, quantity: true, price: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Đơn hàng đã được xử lý" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 401 });
    }

    const allAccountData: Map<string, Array<{ email: string; password: string }>> = new Map();

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "SUCCESS" },
      });

      for (const item of order.orderItems) {
        const availableAccounts = await tx.accountInventory.findMany({
          where: { productId: item.productId, status: "AVAILABLE" },
          take: item.quantity,
          orderBy: { createdAt: "asc" },
        });

        if (availableAccounts.length > 0) {
          const accountData = availableAccounts.map((acc) => ({
            email: acc.email,
            password: acc.password,
          }));

          allAccountData.set(item.productId, accountData);

          await tx.orderItem.updateMany({
            where: { orderId, productId: item.productId },
            data: { accountData: JSON.stringify(accountData) },
          });

          await tx.accountInventory.deleteMany({
            where: { id: { in: availableAccounts.map((a) => a.id) } },
        }

        const remainingStock = await tx.accountInventory.count({
          where: { productId: item.productId, status: "AVAILABLE" },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: remainingStock,
            sold: { increment: item.quantity },
          },
        });
      }
    });

    const products = await db.product.findMany({
      where: { id: { in: order.orderItems.map((i) => i.productId) } },
      select: { id: true, name: true, price: true },
    });

    const accountsHtml = order.orderItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const accounts = allAccountData.get(item.productId) || [];
        if (accounts.length === 0) return "";

        const rows = accounts
          .map(
            (acc) => `
          <p style="margin: 0 0 4px; font-size: 13px; color: #333;"><strong>Email:</strong> ${acc.email}</p>
          <p style="margin: 0 0 16px; font-size: 13px; color: #333;"><strong>Mật khẩu:</strong> ${acc.password}</p>
        `
          )
          .join("");

        return `
        <p style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #111;">${product.name} (x${item.quantity})</p>
        ${rows}
      `;
      })
      .join("");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #111; font-size: 15px; line-height: 1.6;">
        <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 24px; color: #111;">Thanh toán thành công</h1>
        <p style="margin: 0 0 20px; color: #555;">Cảm ơn bạn đã mua hàng. Chi tiết đơn hàng:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Mã đơn</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">${orderId.slice(-8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Khách hàng</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${user.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">Thời gian</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #111;">Tổng tiền</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${fmt(order.totalAmount)}</td>
          </tr>
        </table>
        ${
          accountsHtml
            ? `
        <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px; color: #111;">Tài khoản của bạn</h2>
        <p style="margin: 0 0 16px; font-size: 13px; color: #666;">Đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</p>
        <div style="border: 1px solid #ddd; padding: 16px; margin-bottom: 24px;">
          ${accountsHtml}
        </div>
        `
            : `
        <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #111;">Tài khoản đang xử lý</p>
        <p style="margin: 0 0 24px; font-size: 13px; color: #666;">Tài khoản sẽ được gửi qua email trong 24 giờ.</p>
        `
        }
        <p style="margin: 0; font-size: 12px; color: #999;">Tự động gửi từ Shop Account</p>
      </div>
    `;

    await sendEmailFn(
      user.email,
      `Thanh toán thành công - Đơn ${orderId.slice(-8).toUpperCase()}`,
      html
    );

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (ADMIN_EMAIL) {
      const orderItemsHtml = order.orderItems
        .map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${product.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">x${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${item.price.toLocaleString("vi-VN")} VND</td>
            </tr>
          `;
        })
        .join("");

      sendEmailFn(
        ADMIN_EMAIL,
        `[Đơn Hàng QR] ${user.username} - ${fmt(order.totalAmount)}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
              <h2 style="color: #3B82F6; margin-bottom: 20px;">Đơn hàng mới (QR Payment) từ Shop Account</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Khách hàng</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.username} (${user.email})</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Mã đơn</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tổng tiền</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${fmt(order.totalAmount)}</td>
                </tr>
                ${orderItemsHtml}
                <tr>
                  <td style="padding: 10px; font-weight: bold;">Thời gian</td>
                  <td style="padding: 10px;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                </tr>
              </table>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">Tự động gửi từ Shop Account</p>
            </div>
          </div>
        `
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      status: "SUCCESS",
    });
  } catch (error) {
    console.error("QR order confirm error:", error);
    const message = error instanceof Error ? error.message : "Lỗi server";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
