import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Permission } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Permission[];
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

export interface PermissionCheckOptions {
  requireAll?: boolean;
  redirectTo?: string;
}

export function createAuthError(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}

export function createPermissionError(message: string = "Bạn không có quyền thực hiện hành động này") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function createNotFoundError(message: string = "Không tìm thấy tài nguyên") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function extractAuthFromRequest(request: NextRequest): AuthUser | null {
  const userHeader = request.headers.get("x-user");
  if (!userHeader) return null;

  try {
    return JSON.parse(userHeader) as AuthUser;
  } catch {
    return null;
  }
}

export function checkPermission(
  user: AuthUser | null,
  permission: Permission,
  options?: PermissionCheckOptions
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function checkAnyPermission(
  user: AuthUser | null,
  permissions: Permission[],
  options?: PermissionCheckOptions
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

export function checkAllPermissions(
  user: AuthUser | null,
  permissions: Permission[],
  options?: PermissionCheckOptions
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN" || user.role === "ADMIN";
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN";
}

export function withAuth<T>(
  handler: (request: NextRequest, user: AuthUser, params?: T) => Promise<NextResponse>,
  getParams?: (request: NextRequest) => Promise<T | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractAuthFromRequest(request);

    if (!user) {
      return createAuthError("Vui lòng đăng nhập để tiếp tục");
    }

    let params: T | null = null;
    if (getParams) {
      params = await getParams(request);
      if (params === null) {
        return createNotFoundError("Không tìm thấy tham số");
      }
    }

    return handler(request, user, params!);
  };
}

export function withPermission<T>(
  permission: Permission,
  handler: (request: NextRequest, user: AuthUser, params?: T) => Promise<NextResponse>,
  getParams?: (request: NextRequest) => Promise<T | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractAuthFromRequest(request);

    if (!user) {
      return createAuthError("Vui lòng đăng nhập để tiếp tục");
    }

    if (!checkPermission(user, permission)) {
      return createPermissionError(`Bạn cần quyền "${permission}" để thực hiện hành động này`);
    }

    let params: T | null = null;
    if (getParams) {
      params = await getParams(request);
      if (params === null) {
        return createNotFoundError("Không tìm thấy tham số");
      }
    }

    return handler(request, user, params!);
  };
}

export function withAnyPermission<T>(
  permissions: Permission[],
  handler: (request: NextRequest, user: AuthUser, params?: T) => Promise<NextResponse>,
  getParams?: (request: NextRequest) => Promise<T | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractAuthFromRequest(request);

    if (!user) {
      return createAuthError("Vui lòng đăng nhập để tiếp tục");
    }

    if (!checkAnyPermission(user, permissions)) {
      return createPermissionError("Bạn không có quyền thực hiện hành động này");
    }

    let params: T | null = null;
    if (getParams) {
      params = await getParams(request);
      if (params === null) {
        return createNotFoundError("Không tìm thấy tham số");
      }
    }

    return handler(request, user, params!);
  };
}

export function withAdmin<T>(
  handler: (request: NextRequest, user: AuthUser, params?: T) => Promise<NextResponse>,
  getParams?: (request: NextRequest) => Promise<T | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractAuthFromRequest(request);

    if (!user) {
      return createAuthError("Vui lòng đăng nhập để tiếp tục");
    }

    if (!isAdmin(user)) {
      return createPermissionError("Chỉ admin mới có quyền thực hiện hành động này");
    }

    let params: T | null = null;
    if (getParams) {
      params = await getParams(request);
      if (params === null) {
        return createNotFoundError("Không tìm thấy tham số");
      }
    }

    return handler(request, user, params!);
  };
}

export function withSuperAdmin<T>(
  handler: (request: NextRequest, user: AuthUser, params?: T) => Promise<NextResponse>,
  getParams?: (request: NextRequest) => Promise<T | null>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = extractAuthFromRequest(request);

    if (!user) {
      return createAuthError("Vui lòng đăng nhập để tiếp tục");
    }

    if (!isSuperAdmin(user)) {
      return createPermissionError("Chỉ super admin mới có quyền thực hiện hành động này");
    }

    let params: T | null = null;
    if (getParams) {
      params = await getParams(request);
      if (params === null) {
        return createNotFoundError("Không tìm thấy tham số");
      }
    }

    return handler(request, user, params!);
  };
}

export function validateRequestBody<T>(
  body: unknown,
  requiredFields: (keyof T)[]
): { valid: true; data: T } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const data = body as Record<string, unknown>;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      missingFields.push(String(field));
    }
  }

  if (missingFields.length > 0) {
    return { valid: false, error: `Missing required fields: ${missingFields.join(", ")}` };
  }

  return { valid: true, data: data as T };
}

export function sanitizeSearchQuery(query: string | null): string {
  if (!query) return "";
  return query.replace(/[<>]/g, "").trim().slice(0, 200);
}

export function parsePaginationParams(request: NextRequest): { page: number; limit: number; skip: number } {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
