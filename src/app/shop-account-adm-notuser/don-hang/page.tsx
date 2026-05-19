"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Eye, Loader2 } from "lucide-react";

interface AdminOrder {
  id: string;
  type: "PRODUCT" | "SERVICE";
  product: string;
  price: number;
  status: string;
  date: string;
  createdAt: string;
  user?: { username: string; email: string };
}

const statusConfig: Record<string, { className: string; label: string }> = {
  SUCCESS: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Thành công" },
  COMPLETED: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Hoàn thành" },
  PROCESSING: { className: "bg-[#3B82F6]/20 text-[#3B82F6]", label: "Đang xử lý" },
  PENDING: { className: "bg-[#F59E0B]/20 text-[#F59E0B]", label: "Chờ" },
  FAILED: { className: "bg-[#EF4444]/20 text-[#EF4444]", label: "Thất bại" },
  REFUNDED: { className: "bg-[#A855F7]/20 text-[#A855F7]", label: "Hoàn tiền" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setOrders)
      .catch(() => setError("Không thể tải đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all"
    ? orders
    : filter === "PRODUCT"
    ? orders.filter((o) => o.type === "PRODUCT")
    : filter === "SERVICE"
    ? orders.filter((o) => o.type === "SERVICE")
    : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Đơn hàng</h1>
              <p className="text-sm text-[#64748B]">Tổng {orders.length} đơn hàng</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { key: "all", label: "Tất cả" },
              { key: "PRODUCT", label: "Sản phẩm" },
              { key: "SERVICE", label: "Dịch vụ" },
              { key: "SUCCESS", label: "Thành công" },
              { key: "PROCESSING", label: "Đang xử lý" },
              { key: "PENDING", label: "Chờ" },
              { key: "FAILED", label: "Thất bại" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-[#3B82F6] text-white"
                    : "border border-[#1E293B] text-[#94A3B8] hover:bg-[#1F2937]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Mã đơn", "Loại", "Khách hàng", "Sản phẩm/Dịch vụ", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filtered.map((order) => {
                      const sc = statusConfig[order.status] || { className: "bg-slate-500/20 text-slate-400", label: order.status };
                      return (
                        <tr key={order.id} className="hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-[#3B82F6]">{order.id.slice(-8).toUpperCase()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${order.type === "SERVICE" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                              {order.type === "SERVICE" ? "Dịch vụ" : "Sản phẩm"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-white">{order.user?.username || "N/A"}</p>
                              <p className="text-xs text-[#64748B]">{order.user?.email || ""}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white line-clamp-1 max-w-[200px] block">{order.product}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-sora font-bold text-white">{formatCurrency(order.price)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${sc.className}`}>{sc.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#64748B]">{order.date}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">Chưa có đơn hàng nào</div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
