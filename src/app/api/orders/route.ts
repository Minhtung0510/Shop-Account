import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const [orders, serviceOrders] = await Promise.all([
      db.order.findMany({
        where: { userId: session.user.id },
        include: { orderItems: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
      db.serviceOrder.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      type: "PRODUCT",
      product: order.orderItems.map((item) => item.product?.name).join(", ") || "N/A",
      price: order.totalAmount,
      status: order.status,
      date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
      createdAt: order.createdAt.toISOString(),
    }));

    const formattedServiceOrders = serviceOrders.map((so) => ({
      id: so.id,
      type: "SERVICE",
      product: so.serviceIcon ? `${so.serviceIcon} ${so.serviceName}` : so.serviceName,
      price: so.servicePrice,
      status: so.status,
      date: new Date(so.createdAt).toLocaleDateString("vi-VN"),
      createdAt: so.createdAt.toISOString(),
    }));

    const all = [...formattedOrders, ...formattedServiceOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(all);
  } catch (error) {
    console.error("Orders error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

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
      const { getSMTPTransporter } = await import("@/lib/email");
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

    const body = await request.json();
    const { serviceId, serviceName, servicePrice, phone, telegram, serviceIcon, serviceDescription } = body;

    if (!serviceId || !serviceName || !servicePrice || !phone) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const phoneRegex = /^(0[0-9]{9,10})$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, balance: true, username: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 401 });
    }

    if (user.balance < servicePrice) {
      return NextResponse.json(
        { error: "Số dư không đủ", required: servicePrice, current: user.balance },
        { status: 402 }
      );
    }

    const order = await db.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newOrder = await (tx as any).serviceOrder.create({
        data: {
          userId: session.user.id,
          serviceId,
          serviceName,
          serviceSlug: body.serviceSlug || "",
          serviceIcon: body.serviceIcon || "",
          serviceDescription: body.serviceDescription || "",
          servicePrice,
          phone,
          telegram: telegram || null,
          status: "PENDING",
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { balance: { decrement: servicePrice } },
      });

      return newOrder;
    });

    const newBalance = user.balance - servicePrice;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (ADMIN_EMAIL) {
      sendEmail(
        ADMIN_EMAIL,
        `[Don DV] ${serviceName} - ${phone} - ${user.username}`,
        `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
              <h2 style="color: #3B82F6; margin-bottom: 20px;">Don dat dich vu moi</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Dich vu</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${serviceIcon} ${serviceName}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Gia</td><td style="padding: 10px; border-bottom: 1px solid #eee; color: #3B82F6; font-weight: bold;">${fmt(servicePrice)}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">SDT Zalo</td><td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="https://zalo.me/${phone}" style="color: #3B82F6;">${phone}</a></td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Telegram</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(telegram || "-")}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nguoi dat</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${escapeHtml(user.username)} (${escapeHtml(user.email)})</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Ma don</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${order.id}</td></tr>
                <tr><td style="padding: 10px; font-weight: bold;">Thoi gian</td><td style="padding: 10px;">${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td></tr>
              </table>
            </div>
          </div>
        `
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Đặt dịch vụ thành công",
      newBalance,
    });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
