"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  History,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Loader2,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store";

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  SUCCESS: { icon: CheckCircle, label: "Thành công", color: "bg-[#22C55E]" },
  PROCESSING: { icon: Clock, label: "Đang xử lý", color: "bg-[#3B82F6]" },
  PENDING: { icon: Clock, label: "Đang chờ", color: "bg-[#F59E0B]" },
  FAILED: { icon: XCircle, label: "Thất bại", color: "bg-[#EF4444]" },
  REFUNDED: { icon: RefreshCw, label: "Hoàn tiền", color: "bg-[#A855F7]" },
};

interface OrderItem {
  id: string;
  product?: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Không thể tải đơn hàng");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <History className="h-16 w-16 text-[#334155] mx-auto mb-4" />
          <h2 className="font-sora text-xl font-bold text-white mb-2">Cần đăng nhập</h2>
          <p className="text-[#94A3B8] mb-6">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold text-white mb-2">Lịch sử đơn hàng</h1>
          <p className="text-[#94A3B8]">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "SUCCESS", "PROCESSING", "PENDING", "FAILED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-[#3B82F6] text-white"
                  : "border border-[#1E293B] text-[#94A3B8] hover:bg-[#1F2937]"
              }`}
            >
              {f === "all" ? "Tất cả" : statusConfig[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <Card className="!rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E293B]">
                  {["Mã đơn", "Sản phẩm", "Giá", "Trạng thái", "Ngày mua", "Thao tác"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const productNames = order.items?.map((item) => item.product?.name).join(", ") || "N/A";
                  return (
                    <tr key={order.id} className="hover:bg-[#1F2937]/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-[#3B82F6]">{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white line-clamp-1 max-w-[200px] block">{productNames}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sora text-sm font-bold text-white">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {config && (
                          <Badge className={`${config.color} text-white border-0`}>
                            <config.icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#94A3B8]">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#94A3B8]">Không có đơn hàng nào</p>
            </div>
          )}
        </Card>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled>←</Button>
          <Button variant="outline" size="sm" className="bg-[#1F2937]">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">→</Button>
        </div>
      </div>
    </div>
  );
}
