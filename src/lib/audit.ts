"use server";

import { db } from "./db";
import { auth } from "./auth";
import { headers } from "next/headers";
import type { AuditAction, EntityType, AuditLogFilter } from "@/types";
import type { Prisma } from "@prisma/client";

interface CreateAuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    // Only log if userId is provided and user is ADMIN
    if (!params.userId) {
      return { success: false, error: "userId is required for admin audit logging" };
    }

    // Check if user is ADMIN
    const user = await db.user.findUnique({
      where: { id: params.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { success: false, skipped: true };
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const auditLog = await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues as Prisma.InputJsonValue | undefined,
        newValues: params.newValues as Prisma.InputJsonValue | undefined,
        ipAddress: ipAddress,
        userAgent: userAgent,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return { success: true, data: auditLog };
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return { success: false, error: "Failed to create audit log" };
  }
}

export async function getAuditLogs(filter: AuditLogFilter = {}) {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return {
      success: true,
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    return { success: false, error: "Failed to get audit logs" };
  }
}

export async function getAuditLogById(id: string) {
  try {
    const log = await db.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!log) {
      return { success: false, error: "Audit log not found" };
    }

    return { success: true, data: log };
  } catch (error) {
    console.error("Failed to get audit log:", error);
    return { success: false, error: "Failed to get audit log" };
  }
}

export async function getRecentAuditLogs(limit: number = 10) {
  try {
    const logs = await db.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Failed to get recent audit logs:", error);
    return { success: false, error: "Failed to get recent audit logs" };
  }
}

export async function deleteOldAuditLogs(daysOld: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return { success: true, data: { deletedCount: result.count } };
  } catch (error) {
    console.error("Failed to delete old audit logs:", error);
    return { success: false, error: "Failed to delete old audit logs" };
  }
}

export async function getAuditStats() {
  try {
    const [totalLogs, todayLogs, thisWeekLogs, actionCounts] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.auditLog.groupBy({
        by: ["action"],
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        totalLogs,
        todayLogs,
        thisWeekLogs,
        actionCounts: actionCounts.reduce((acc, item) => {
          acc[item.action] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    console.error("Failed to get audit stats:", error);
    return { success: false, error: "Failed to get audit stats" };
  }
}
