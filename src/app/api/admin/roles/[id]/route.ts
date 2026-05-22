import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import type { Permission } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const role = await db.role.findUnique({
      where: { id },
      include: {
        userRoles: {
          select: { userId: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
    }

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions as Permission[],
        isSystem: role.isSystem,
        userCount: role.userRoles.length,
      },
    });
  } catch (error) {
    console.error("Failed to get role:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thông tin vai trò" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, permissions } = body;

    const existingRole = await db.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: "Không thể sửa vai trò hệ thống" }, { status: 403 });
    }

    const role = await db.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions,
        updatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: body.updatedBy,
      action: "UPDATE",
      entityType: "roles",
      entityId: id,
      oldValues: {
        name: existingRole.name,
        description: existingRole.description,
        permissions: existingRole.permissions,
      },
      newValues: { name, description, permissions },
    });

    return NextResponse.json({
      success: true,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
      },
    });
  } catch (error) {
    console.error("Failed to update role:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật vai trò" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const role = await db.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "Không thể xóa vai trò hệ thống" }, { status: 403 });
    }

    await db.role.delete({
      where: { id },
    });

    await createAuditLog({
      userId: new URL(request.url).searchParams.get("deletedBy") || undefined,
      action: "DELETE",
      entityType: "roles",
      entityId: id,
      oldValues: { name: role.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete role:", error);
    return NextResponse.json({ error: "Lỗi khi xóa vai trò" }, { status: 500 });
  }
}
