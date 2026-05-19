"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Eye, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";

interface AdminOrder {
  id: string;
  product: string;
  price: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUNDED";
  date: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Không thể tải đơn hàng");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AdminOrder["status"]) => {
    const variants: Record<AdminOrder["status"], { className: string; label: string }> = {
      SUCCESS: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Thành công" },
      PROCESSING: { className: "bg-[#3B82F6]/20 text-[#3B82F6]", label: "Đang xử lý" },
      PENDING: { className: "bg-[#F59E0B]/20 text-[#F59E0B]", label: "Chờ" },
      FAILED: { className: "bg-[#EF4444]/20 text-[#EF4444]", label: "Thất bại" },
      REFUNDED: { className: "bg-[#A855F7]/20 text-[#A855F7]", label: "Hoàn tiền" },
    };
    return variants[status] || { className: "bg-[#64748B]/20 text-[#64748B]", label: status };
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Đơn hàng</h1>
              <p className="text-sm text-[#64748B]">Quản lý đơn hàng của khách hàng</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">
                {error}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Mã đơn", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày", "Thao tác"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {orders.map((order) => {
                      const statusBadge = getStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-[#3B82F6]">{order.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white">{order.product}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-sora font-bold text-white">{formatCurrency(order.price)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${statusBadge.className}`}>
                              {statusBadge.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#64748B]">{order.date}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white">
                                <Eye className="h-4 w-4" />
                              </button>
                              {order.status === "PENDING" && (
                                <>
                                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#22C55E] hover:bg-[#22C55E]/10">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10">
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">
                    Chưa có đơn hàng nào
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
