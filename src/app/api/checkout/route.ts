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
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        _count: { select: { accountInventory: { where: { status: "AVAILABLE" } } } },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Một số sản phẩm không tồn tại" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items as { productId: string; quantity?: number }[]) {
      const product = products.find((p) => p.id === item.productId)!;
      const quantity = item.quantity || 1;
      const availableStock = product._count.accountInventory;
      totalAmount += product.price * quantity;

      if (quantity > availableStock) {
        return NextResponse.json(
          { error: `Sản phẩm "${product.name}" chỉ còn ${availableStock} trong kho` },
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

    const allAccountData: Map<string, Array<{ email: string; password: string }>> = new Map();

    const order = await db.$transaction(async (tx) => {
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

      for (const item of orderItemsData) {
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
            where: { orderId: newOrder.id, productId: item.productId },
            data: { accountData: JSON.stringify(accountData) },
          });

          await tx.accountInventory.deleteMany({
            where: { id: { in: availableAccounts.map((a) => a.id) } },
          });
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

      return newOrder;
    }, { timeout: 30000 });

    const newBalance = user.balance - totalAmount;

    await sendPurchaseEmail(user, products, orderItemsData, order.id, allAccountData);

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (ADMIN_EMAIL) {
      const orderItemsHtml = orderItemsData
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
        `[Đơn Hàng] ${user.username} - ${fmt(totalAmount)}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
              <h2 style="color: #3B82F6; margin-bottom: 20px;">Đơn hàng mới từ Shop Account</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Khách hàng</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${user.username} (${user.email})</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Mã đơn</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Tổng tiền</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${fmt(totalAmount)}</td>
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

async function sendPurchaseEmail(
  user: { email: string; username: string },
  products: Array<{ id: string; name: string; price: number }>,
  orderItemsData: Array<{ productId: string; quantity: number; price: number }>,
  orderId: string,
  allAccountData: Map<string, Array<{ email: string; password: string }>>
) {
  const accountsHtml = orderItemsData
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const accounts = allAccountData.get(item.productId) || [];
      if (accounts.length === 0) return "";

      const rows = accounts
        .map(
          (acc, i) => `
          <p style="margin: 0 0 4px; font-size: 13px; color: #333;"><strong>Email:</strong> ${acc.email}</p>
          <p style="margin: 0 0 16px; font-size: 13px; color: #333;"><strong>Mat khau:</strong> ${acc.password}</p>
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
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${fmt(orderItemsData.reduce((sum, i) => sum + i.price * i.quantity, 0))}</td>
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
}
