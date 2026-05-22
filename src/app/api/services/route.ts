import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform") || "";

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (platform) {
      where.category = platform;
    }

    const services = await db.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
