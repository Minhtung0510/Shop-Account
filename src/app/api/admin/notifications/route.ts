import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
          clearInterval(pollOrders);
        }
      }, 15000);

      let lastOrderId: string | null = null;
      let lastServiceOrderId: string | null = null;
      let lastTopupId: string | null = null;

      const pollOrders = setInterval(async () => {
        try {
          const [lastOrder, lastServiceOrder] = await Promise.all([
            db.order.findFirst({
              orderBy: { createdAt: "desc" },
              select: { id: true, totalAmount: true, status: true, createdAt: true, user: { select: { username: true } } },
            }),
            db.serviceOrder.findFirst({
              orderBy: { createdAt: "desc" },
              select: { id: true, servicePrice: true, status: true, serviceName: true, createdAt: true, user: { select: { username: true } } },
            }),
          ]);

          if (lastOrder && lastOrder.id !== lastOrderId) {
            lastOrderId = lastOrder.id;
            sendEvent("new_order", {
              type: "PRODUCT",
              id: lastOrder.id,
              user: lastOrder.user?.username || "N/A",
              amount: lastOrder.totalAmount,
              status: lastOrder.status,
              createdAt: lastOrder.createdAt.toISOString(),
            });
          }

          if (lastServiceOrder && lastServiceOrder.id !== lastServiceOrderId) {
            lastServiceOrderId = lastServiceOrder.id;
            sendEvent("new_order", {
              type: "SERVICE",
              id: lastServiceOrder.id,
              user: lastServiceOrder.user?.username || "N/A",
              amount: lastServiceOrder.servicePrice,
              status: lastServiceOrder.status,
              serviceName: lastServiceOrder.serviceName,
              createdAt: lastServiceOrder.createdAt.toISOString(),
            });
          }

          const lastTopup = await db.topupTransaction.findFirst({
            orderBy: { createdAt: "desc" },
            include: { user: { select: { username: true } } },
            where: { status: "PENDING" },
          });

          if (lastTopup && lastTopup.id !== lastTopupId) {
            lastTopupId = lastTopup.id;
            sendEvent("new_topup", {
              id: lastTopup.id,
              user: lastTopup.user?.username || "N/A",
              amount: lastTopup.amount,
              bankCode: lastTopup.bankCode,
              transferContent: lastTopup.transferContent,
              createdAt: lastTopup.createdAt.toISOString(),
            });
          }
        } catch (e) {
          console.error("SSE poll error:", e);
        }
      }, 5000);

      sendEvent("connected", { ok: true });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
