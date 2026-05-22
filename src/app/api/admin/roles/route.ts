import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Permission } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const roles = await db.role.findMany({
      include: {
        userRoles: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions as Permission[],
        isSystem: role.isSystem,
        userCount: role.userRoles.length,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to get roles:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách vai trò" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json(
        { error: "Tên và permissions là bắt buộc" },
        { status: 400 }
      );
    }

    const existingRole = await db.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Tên vai trò đã tồn tại" },
        { status: 400 }
      );
    }

    const role = await db.role.create({
      data: {
        name,
        description,
        permissions: permissions,
        isSystem: false,
      },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        createdAt: role.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to create role:", error);
    return NextResponse.json({ error: "Lỗi khi tạo vai trò" }, { status: 500 });
  }
}
