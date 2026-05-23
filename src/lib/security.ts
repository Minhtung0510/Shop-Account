/**
 * Security utilities for the application
 * Includes password validation, rate limiting helpers, and security constants
 */

import bcrypt from "bcryptjs";

/**
 * Password policy configuration
 */
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  maxLength: 128,
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  register: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  checkout: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate password against policy
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_POLICY.minLength} ký tự`);
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Mật khẩu không được quá ${PASSWORD_POLICY.maxLength} ký tự`);
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Phải có ít nhất 1 chữ hoa (A-Z)");
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Phải có ít nhất 1 chữ thường (a-z)");
  }

  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    errors.push("Phải có ít nhất 1 số (0-9)");
  }

  if (PASSWORD_POLICY.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((v) => chars[v % chars.length])
    .join("");
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return "*".repeat(data.length);
  }
  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = "*".repeat(Math.min(data.length - visibleChars * 2, 10));
  return `${start}${masked}${end}`;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/**
 * Check if a string is a valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

/**
 * Security headers to be added to responses
 */
export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
} as const;

/**
 * Content Security Policy
 */
export const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "media-src 'self' https:",
  "connect-src 'self' https://www.googleapis.com https://oauth2.googleapis.com",
  "frame-src 'self' https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

/**
 * In-memory rate limit store (for single-instance deployments)
 * In production, consider using Redis for distributed rate limiting
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for an identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    cleanupExpiredEntries(now);
  }

  if (!entry || now > entry.resetAt) {
    // Create new entry
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count, resetAt: entry.resetAt };
}

/**
 * Get rate limit info without incrementing
 */
export function getRateLimitInfo(
  identifier: string
): { count: number; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    return { count: 0, remaining: -1, resetAt: 0 };
  }

  return { count: entry.count, remaining: -1, resetAt: entry.resetAt };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Create a rate limit key from request
 */
export function createRateLimitKey(type: string, identifier: string): string {
  return `${type}:${identifier}`;
}

/**
 * Validate password strength (for hashing decision)
 */
export async function isPasswordHashed(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    return false;
  }
}
