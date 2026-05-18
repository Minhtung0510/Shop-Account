import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateUID(): string {
  return "UID_" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SUCCESS: "bg-green-500/20 text-green-400 border-green-500/30",
    PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PROCESSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
    REFUNDED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    APPROVED: "bg-green-500/20 text-green-400 border-green-500/30",
    REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export function getBadgeColor(badge: string): string {
  const colors: Record<string, string> = {
    BEST_SELLER: "bg-orange-500/20 text-orange-400",
    HOT: "bg-red-500/20 text-red-400",
    PREMIUM: "bg-purple-500/20 text-purple-400",
    NEW: "bg-blue-500/20 text-blue-400",
  };
  return colors[badge] || "";
}
