"use server";

import { db } from "./db";
import type { Permission, Role, RoleWithUserCount, RoleLevel } from "@/types";
import { createAuditLog } from "./audit";
import { RoleLevel as RoleLevelEnum, ROLE_LABELS } from "@/types";

const PERMISSION_GROUPS: Record<string, Permission[]> = {
  users: ["users:read", "users:create", "users:update", "users:delete"],
  products: ["products:read", "products:create", "products:update", "products:delete"],
  categories: ["categories:read", "categories:create", "categories:update", "categories:delete"],
  orders: ["orders:read", "orders:update", "orders:delete", "orders:refund"],
  transactions: ["transactions:read", "transactions:create"],
  settings: ["settings:read", "settings:update"],
  audit_logs: ["audit_logs:read", "audit_logs:delete"],
  reports: ["reports:read", "reports:export"],
  roles: ["roles:read", "roles:create", "roles:update", "roles:delete"],
  warranty: ["warranty:read", "warranty:update"],
  services: ["services:read", "services:create", "services:update", "services:delete"],
};

export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSION_GROUPS).flat() as Permission[];
}

export function getPermissionsByGroup(): Record<string, Permission[]> {
  return PERMISSION_GROUPS;
}

export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((p) => userPermissions.includes(p));
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((p) => userPermissions.includes(p));
}

export function getRoleLevelNumber(level: RoleLevel): number {
  return level;
}

export function canManageRole(userLevel: number, targetLevel: number): boolean {
  return userLevel < targetLevel;
}

export function canAccessRoute(roleLevel: number, routeLevel: number): boolean {
  return roleLevel <= routeLevel;
}

export function getRouteRequiredLevel(pathname: string): number {
  const routeLevels: Record<string, number> = {
    "/adm/super-admin": RoleLevelEnum.SUPER_ADMIN,
    "/adm/admin": RoleLevelEnum.ADMIN,
    "/adm/moderator": RoleLevelEnum.MODERATOR,
    "/adm/staff": RoleLevelEnum.STAFF,
    "/adm": RoleLevelEnum.ADMIN,
    "/adm/products": RoleLevelEnum.ADMIN,
    "/adm/categories": RoleLevelEnum.ADMIN,
    "/adm/orders": RoleLevelEnum.MODERATOR,
    "/adm/users": RoleLevelEnum.ADMIN,
    "/adm/finance": RoleLevelEnum.ADMIN,
    "/adm/warranty": RoleLevelEnum.MODERATOR,
    "/adm/services": RoleLevelEnum.ADMIN,
    "/adm/settings": RoleLevelEnum.ADMIN,
    "/adm/roles": RoleLevelEnum.SUPER_ADMIN,
    "/adm/audit": RoleLevelEnum.ADMIN,
  };

  for (const [route, level] of Object.entries(routeLevels)) {
    if (pathname.startsWith(route)) {
      return level;
    }
  }

  return RoleLevelEnum.ADMIN;
}

export async function getUserRoleLevel(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return RoleLevelEnum.USER;

  const role = await db.role.findUnique({
    where: { name: user.role },
    select: { level: true },
  });

  return role?.level ?? RoleLevelEnum.USER;
}

export async function checkRouteAccess(userId: string, pathname: string): Promise<boolean> {
  const userLevel = await getUserRoleLevel(userId);
  const requiredLevel = getRouteRequiredLevel(pathname);

  return userLevel <= requiredLevel;
}

export async function getRoleByName(name: string): Promise<Role | null> {
  try {
    const role = await db.role.findUnique({
      where: { name },
    });

    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      level: role.level as RoleLevel,
      description: role.description || undefined,
      permissions: (role.permissions as Permission[]) || [],
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get role by name:", error);
    return null;
  }
}

export async function getRoleById(id: string): Promise<Role | null> {
  try {
    const role = await db.role.findUnique({
      where: { id },
    });

    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      level: role.level as RoleLevel,
      description: role.description || undefined,
      permissions: (role.permissions as Permission[]) || [],
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get role by id:", error);
    return null;
  }
}

export async function getAllRoles(): Promise<RoleWithUserCount[]> {
  try {
    const roles = await db.role.findMany({
      include: {
        userRoles: {
          select: { userId: true },
        },
      },
      orderBy: { level: "asc" },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      level: role.level as RoleLevel,
      description: role.description || undefined,
      permissions: (role.permissions as Permission[]) || [],
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      userCount: role.userRoles.length,
    }));
  } catch (error) {
    console.error("Failed to get all roles:", error);
    return [];
  }
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) return [];

    const permissions = new Set<Permission>();

    user.userRoles.forEach((ur) => {
      (ur.role.permissions as Permission[]).forEach((p) => permissions.add(p));
    });

    return Array.from(permissions);
  } catch (error) {
    console.error("Failed to get user permissions:", error);
    return [];
  }
}

export async function createRole(
  name: string,
  level: number,
  description: string | undefined,
  permissions: Permission[],
  createdByUserId: string
) {
  try {
    const existingRole = await db.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return { success: false, error: "Role already exists" };
    }

    const role = await db.role.create({
      data: {
        name,
        level,
        description,
        permissions: permissions,
        isSystem: false,
      },
    });

    await createAuditLog({
      userId: createdByUserId,
      action: "CREATE",
      entityType: "roles",
      entityId: role.id,
      newValues: { name, level, description, permissions },
    });

    return { success: true, data: role };
  } catch (error) {
    console.error("Failed to create role:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function updateRole(
  roleId: string,
  data: { name?: string; level?: number; description?: string; permissions?: Permission[] },
  updatedByUserId: string
) {
  try {
    const existingRole = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return { success: false, error: "Role not found" };
    }

    if (existingRole.isSystem) {
      return { success: false, error: "Cannot modify system role" };
    }

    const oldValues = {
      name: existingRole.name,
      level: existingRole.level,
      description: existingRole.description,
      permissions: existingRole.permissions,
    };

    const role = await db.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        level: data.level,
        description: data.description,
        permissions: data.permissions,
        updatedAt: new Date(),
      },
    });

    await createAuditLog({
      userId: updatedByUserId,
      action: "UPDATE",
      entityType: "roles",
      entityId: roleId,
      oldValues,
      newValues: data,
    });

    return { success: true, data: role };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteRole(roleId: string, deletedByUserId: string) {
  try {
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return { success: false, error: "Role not found" };
    }

    if (role.isSystem) {
      return { success: false, error: "Cannot delete system role" };
    }

    await db.role.delete({
      where: { id: roleId },
    });

    await createAuditLog({
      userId: deletedByUserId,
      action: "DELETE",
      entityType: "roles",
      entityId: roleId,
      oldValues: { name: role.name },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete role:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

export async function assignRoleToUser(userId: string, roleId: string, assignedByUserId: string) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    const role = await db.role.findUnique({ where: { id: roleId } });

    if (!user || !role) {
      return { success: false, error: "User or role not found" };
    }

    await db.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      create: { userId, roleId },
      update: {},
    });

    await createAuditLog({
      userId: assignedByUserId,
      action: "ROLE_CHANGE",
      entityType: "users",
      entityId: userId,
      newValues: { role: role.name },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to assign role to user:", error);
    return { success: false, error: "Failed to assign role" };
  }
}

export async function removeRoleFromUser(userId: string, roleId: string, removedByUserId: string) {
  try {
    await db.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    await createAuditLog({
      userId: removedByUserId,
      action: "ROLE_CHANGE",
      entityType: "users",
      entityId: userId,
      oldValues: { roleId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to remove role from user:", error);
    return { success: false, error: "Failed to remove role" };
  }
}

export async function initializeDefaultRoles() {
  try {
    const existingRoles = await db.role.count();
    if (existingRoles > 0) return { success: true, message: "Roles already initialized" };

    const defaultRoles = [
      {
        name: "SUPER_ADMIN",
        level: RoleLevelEnum.SUPER_ADMIN,
        description: "Chủ Shop - Toàn quyền quản lý hệ thống",
        permissions: [
          "users:read", "users:create", "users:update", "users:delete",
          "products:read", "products:create", "products:update", "products:delete",
          "categories:read", "categories:create", "categories:update", "categories:delete",
          "orders:read", "orders:update", "orders:delete", "orders:refund",
          "transactions:read", "transactions:create",
          "settings:read", "settings:update",
          "audit_logs:read", "audit_logs:delete",
          "reports:read", "reports:export",
          "roles:read", "roles:create", "roles:update", "roles:delete",
          "warranty:read", "warranty:update",
          "services:read", "services:create", "services:update", "services:delete",
        ],
        isSystem: true,
      },
      {
        name: "ADMIN",
        level: RoleLevelEnum.ADMIN,
        description: "Quản trị viên - Quản lý sản phẩm, đơn hàng, người dùng",
        permissions: [
          "users:read", "users:update",
          "products:read", "products:create", "products:update", "products:delete",
          "categories:read", "categories:create", "categories:update",
          "orders:read", "orders:update",
          "transactions:read",
          "settings:read",
          "audit_logs:read",
          "reports:read", "reports:export",
          "warranty:read", "warranty:update",
          "services:read", "services:create", "services:update",
        ],
        isSystem: true,
      },
      {
        name: "MODERATOR",
        level: RoleLevelEnum.MODERATOR,
        description: "Điều hành viên - Xử lý đơn hàng, bảo hành",
        permissions: [
          "products:read", "products:update",
          "categories:read",
          "orders:read", "orders:update",
          "reports:read",
          "warranty:read", "warranty:update",
        ],
        isSystem: true,
      },
      {
        name: "STAFF",
        level: RoleLevelEnum.STAFF,
        description: "Nhân viên - Hỗ trợ cơ bản",
        permissions: [
          "products:read",
          "categories:read",
          "orders:read",
        ],
        isSystem: true,
      },
      {
        name: "USER",
        level: RoleLevelEnum.USER,
        description: "Người dùng - Khách hàng",
        permissions: [
          "products:read",
        ],
        isSystem: true,
      },
    ];

    await db.role.createMany({
      data: defaultRoles,
    });

    return { success: true, message: "Default roles initialized" };
  } catch (error) {
    console.error("Failed to initialize default roles:", error);
    return { success: false, error: "Failed to initialize roles" };
  }
}
