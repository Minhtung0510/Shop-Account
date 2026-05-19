"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export interface AdminOrder {
  id: string;
  type: "PRODUCT" | "SERVICE";
  product: string;
  price: number;
  status: string;
  date: string;
  createdAt: string;
  user?: { username: string; email: string };
}

export interface AdminWarranty {
  id: string;
  userId: string;
  orderId: string;
  orderType: string;
  productName: string;
  issue: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  user: { username: string; email: string };
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  role: string;
  balance: number;
  rank: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface OrderCount {
  serviceCount: number;
  warrantyCount: number;
}

export interface ApiError {
  error: string;
}

// ---- Orders ----

export function useAdminOrders() {
  return useQuery<AdminOrder[]>({
    queryKey: ["admin", "orders"],
    queryFn: () => fetch("/api/admin/orders").then((r) => r.json()),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; type: string; status: string }) =>
      fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Update failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      qc.invalidateQueries({ queryKey: ["admin", "orderCount"] });
    },
  });
}

// ---- Warranties ----

export function useAdminWarranties(status?: string) {
  return useQuery<{ warranties: AdminWarranty[] }>({
    queryKey: ["admin", "warranties", status],
    queryFn: () => {
      const url = status ? `/api/admin/warranties?status=${status}` : "/api/admin/warranties";
      return fetch(url).then((r) => r.json());
    },
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });
}

export function useUpdateWarrantyStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: string; adminNote?: string }) =>
      fetch("/api/admin/warranties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Update failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "warranties"] });
      qc.invalidateQueries({ queryKey: ["admin", "orderCount"] });
    },
  });
}

// ---- Accounts ----

export function useAdminAccounts() {
  return useQuery<AdminAccount[]>({
    queryKey: ["admin", "accounts"],
    queryFn: () => fetch("/api/admin/accounts").then((r) => r.json()),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });
}

export function useUpdateAccountBalance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; amount: number; type: "ADD" | "SUBTRACT" }) =>
      fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Update failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "accounts"] });
    },
  });
}

// ---- Stats ----

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => r.json()),
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

// ---- Order count (sidebar badge) ----

export function useAdminOrderCount() {
  return useQuery<OrderCount>({
    queryKey: ["admin", "orderCount"],
    queryFn: () => fetch("/api/admin/orders/count").then((r) => r.json()),
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });
}
