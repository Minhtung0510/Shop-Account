"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Product, Category } from "@/types";

export { Product, Category };

// ---- Shared query keys (dung chung giua admin va user) ----

export const QUERY_KEYS = {
  products: (filters?: { category?: string; search?: string; page?: number }) =>
    ["products", filters ?? {}] as const,
  product: (slug: string) => ["product", slug] as const,
  services: (platform?: string) => ["services", platform ?? "all"] as const,
  userOrders: () => ["user", "orders"] as const,
  userMe: () => ["user", "me"] as const,
} as const;

// ---- Home page ----

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  sold: number;
  thumbnail?: string;
  images: string[];
  badge?: string;
  rating?: number;
  category?: { id: string; name: string; slug: string };
  accountCount?: number;
}

export interface HomeData {
  products: HomeProduct[];
  categories: Array<{ id: string; name: string; slug: string; icon: string; productCount: number; color?: string; fromPrice?: number }>;
  services: ServiceItem[];
}

export function useHomeProducts() {
  return useQuery<HomeData>({
    queryKey: ["home", "products"],
    queryFn: () => fetch("/api/home/products?limit=12").then((r) => r.json()),
    staleTime: 60 * 1000,
  });
}

// ---- Products ----

// API returns items with stock from _count.accountInventory — use loose typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProduct = any;

export interface ProductListRes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}

export function useProducts(filters?: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters?.sort) params.set("sort", filters.sort);

  return useQuery<ProductListRes>({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: () => fetch(`/api/products?${params}`).then((r) => r.json()),
    staleTime: 60 * 1000,
  });
}

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: () => fetch(`/api/products/${slug}`).then((r) => r.json()),
    staleTime: 60 * 1000,
    enabled: !!slug,
  });
}

// ---- Categories ----

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((r) => r.json()),
    staleTime: 300 * 1000,
  });
}

// ---- Services ----

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  status: string;
  category: string;
  features: string[];
}

export function useServices(platform?: string) {
  return useQuery<ServiceItem[]>({
    queryKey: QUERY_KEYS.services(platform),
    queryFn: () => {
      const url =
        platform && platform !== "all"
          ? `/api/services?platform=${platform}`
          : "/api/services";
      return fetch(url).then((r) => r.json());
    },
    staleTime: 60 * 1000,
  });
}

// ---- User Orders ----

export interface UserOrder {
  id: string;
  type: "PRODUCT" | "SERVICE";
  product: string;
  price: number;
  status: string;
  date: string;
  createdAt: string;
  orderItems?: Array<{
    product?: { name: string };
    accountData?: string;
  }>;
  serviceName?: string;
  serviceIcon?: string;
  phone?: string;
  telegram?: string;
  serviceDescription?: string;
}

export interface OrderDetail {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    accountData: string | null;
    product?: { name: string; thumbnail?: string };
  }>;
}

export function useUserOrders() {
  return useQuery<UserOrder[]>({
    queryKey: QUERY_KEYS.userOrders(),
    queryFn: () => fetch("/api/orders").then((r) => r.json()),
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

export function useOrderDetail(id: string) {
  return useQuery<OrderDetail>({
    queryKey: ["user", "order", id],
    queryFn: () => fetch(`/api/orders/${id}`).then((r) => r.json()),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

// ---- User me ----

export interface UserMe {
  id: string;
  username: string;
  email: string;
  phone?: string;
  balance: number;
  role: string;
  rank: string;
  createdAt: string;
}

export function useUserMe() {
  return useQuery<UserMe>({
    queryKey: QUERY_KEYS.userMe(),
    queryFn: () => fetch("/api/me").then((r) => r.json()),
    staleTime: 60 * 1000,
    retry: false,
  });
}

// ---- Cart / Checkout mutation ----

export function useCheckout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (items: { productId: string; quantity?: number }[]) =>
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Checkout failed");
        }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.userOrders() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.userMe() });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ---- Service order mutation ----

export function useServiceOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      serviceId: string;
      serviceName: string;
      servicePrice: number;
      phone: string;
      telegram?: string;
      serviceIcon?: string;
      serviceDescription?: string;
      serviceSlug?: string;
    }) =>
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Order failed");
        }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.userOrders() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.userMe() });
    },
  });
}

// ---- User Profile mutations ----

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  balance: number;
  rank: string;
  role: string;
  createdAt: string;
  name?: string;
}

export interface UserStats {
  balance: number;
  totalOrders: number;
  totalSpent: number;
  topupTotal: number;
  lastOrder: string | null;
  lastTopup: string | null;
}

export function useUserProfile() {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.userMe(),
    queryFn: () => fetch("/api/me").then((r) => r.json()),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ["user", "stats"],
    queryFn: () => fetch("/api/me/stats").then((r) => r.json()),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { username: string; phone?: string }) =>
      fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Cập nhật thất bại");
        }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.userMe() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      fetch("/api/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) {
          const err = await r.json();
          throw new Error(err.error || "Đổi mật khẩu thất bại");
        }
        return r.json();
      }),
  });
}
