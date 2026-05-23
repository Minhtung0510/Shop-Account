import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-auth";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { authorized, response } = await requireAdmin();
    if (!authorized) return response;
    
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          balance: true,
          rank: true,
          isLocked: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              topupTransactions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to get users:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách người dùng" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });
    
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID là bắt buộc" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (existingUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Không thể sửa đổi thông tin Admin" },
        { status: 403 }
      );
    }

    if (updateData.role === "ADMIN") {
      return NextResponse.json(
        { error: "Không thể phong quyền Admin cho người khác" },
        { status: 403 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role: updateData.role,
        isLocked: updateData.isLocked,
        balance: updateData.balance,
        rank: updateData.rank,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        balance: true,
        rank: true,
        isLocked: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      entityType: "users",
      entityId: userId,
      oldValues: {
        role: existingUser.role,
        isLocked: existingUser.isLocked,
        balance: existingUser.balance,
      },
      newValues: {
        role: updateData.role,
        isLocked: updateData.isLocked,
        balance: updateData.balance,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật người dùng" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { authorized, response, session } = await requireAdmin();
    if (!authorized) return response;

    if (!session) return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID là bắt buộc" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Không thể xóa Admin" }, { status: 403 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "Không thể tự xóa chính mình" }, { status: 400 });
    }

    await db.user.delete({
      where: { id: userId },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      entityType: "users",
      entityId: userId,
      oldValues: {
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Lỗi khi xóa người dùng" }, { status: 500 });
  }
}
