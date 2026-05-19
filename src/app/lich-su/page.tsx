"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import {
  History,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useMockSession } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  SUCCESS: { icon: CheckCircle, label: "Thành công", color: "bg-success" },
  PROCESSING: { icon: Clock, label: "Đang xử lý", color: "bg-primary" },
  PENDING: { icon: Clock, label: "Đang chờ", color: "bg-warning" },
  FAILED: { icon: XCircle, label: "Thất bại", color: "bg-error" },
  REFUNDED: { icon: RefreshCw, label: "Hoàn tiền", color: "bg-purple-500" },
};

export default function OrderHistoryPage() {
  const { data: session } = useMockSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-bg-primary">
        <div className="text-center">
          <History className="h-16 w-16 text-text-muted mx-auto mb-4" />
          <h2 className="font-sora text-xl font-bold text-text-primary mb-2">Cần đăng nhập</h2>
          <p className="text-text-secondary mb-6">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  const filteredOrders = filter === "all"
    ? mockOrders
    : mockOrders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold text-text-primary mb-2">Lịch sử đơn hàng</h1>
          <p className="text-text-secondary">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "SUCCESS", "PROCESSING", "PENDING", "FAILED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-white"
                  : "border border-border text-text-secondary hover:bg-bg-card-hover"
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
                <tr className="border-b border-border">
                  {["Mã đơn", "Sản phẩm", "Giá", "Trạng thái", "Ngày mua", "Thao tác"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-bg-card-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-primary">{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-primary">{order.product}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sora text-sm font-bold text-text-primary">{formatCurrency(order.price)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${config.color} text-white border-0`}>
                          <config.icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-secondary">{order.date}</span>
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
              <History className="h-12 w-12 text-text-muted mb-3" />
              <p className="text-text-secondary">Không có đơn hàng nào</p>
            </div>
          )}
        </Card>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled>←</Button>
          <Button variant="outline" size="sm" className="bg-bg-card-hover">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">→</Button>
        </div>
      </div>
    </div>
  );
}
