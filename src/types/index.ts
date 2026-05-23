/**
 * ShopAccount - Type definitions
 */

// ============ E-COMMERCE TYPES ============

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  thumbnail: string;
  images: string;
  stock: number;
  rating: number;
  sold: number;
  warranty?: string;
  badge?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ AUDIT LOG TYPES ============

export type AuditAction = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'ROLE_CHANGE'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'REFUND'
  | 'LOGIN_BLOCKED'
  | 'BRUTE_FORCE_BLOCKED'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMITED';

export type EntityType = 
  | 'users'
  | 'products'
  | 'categories'
  | 'orders'
  | 'transactions'
  | 'settings'
  | 'roles'
  | 'audit_logs'
  | 'auth';

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
