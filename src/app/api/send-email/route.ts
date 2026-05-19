import { NextResponse } from "next/server";
import { getSMTPTransporter } from "@/lib/email";

export const dynamic = "force-dynamic";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendViaSMTP(to: string, subject: string, html: string) {
  const t = getSMTPTransporter();
  await t.sendMail({
    from: `"Shop Account" <${process.env.FROM_EMAIL || "noreply@shopaccount.com"}>`,
    to,
    subject,
    html,
  });
}

async function sendViaResend(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || "Shop Account <noreply@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

async function sendViaBrevo(to: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: process.env.FROM_EMAIL || "noreply@shopaccount.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Brevo ${res.status}: ${text}`);
  }
}

export async function POST(request: Request) {
  let body: EmailPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { to, subject, html } = body;

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Thiếu thông tin email" }, { status: 400 });
  }

  const smtpReady = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  const resendReady = !!process.env.RESEND_API_KEY;
  const brevoReady = !!process.env.BREVO_API_KEY;

  if (!smtpReady && !resendReady && !brevoReady) {
    console.log("=== EMAIL (no provider) ===");
    console.log("To:", to, "| Subject:", subject);
    return NextResponse.json({ success: true, note: "no provider" });
  }

  try {
    if (smtpReady) {
      await sendViaSMTP(to, subject, html);
    } else if (resendReady) {
      await sendViaResend(to, subject, html);
    } else if (brevoReady) {
      await sendViaBrevo(to, subject, html);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Send email failed:", msg);
    return NextResponse.json({ error: "Lỗi gửi email", detail: msg }, { status: 500 });
  }
}
