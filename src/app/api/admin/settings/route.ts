import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const settings = await db.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json(map);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Thiếu key hoặc value" }, { status: 400 });
    }

    await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
