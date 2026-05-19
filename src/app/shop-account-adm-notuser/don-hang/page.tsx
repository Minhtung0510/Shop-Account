"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdmin";
import type { AdminOrder } from "@/hooks/useAdmin";

const statusConfig: Record<string, { className: string; label: string }> = {
  SUCCESS: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Thành công" },
  COMPLETED: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Hoàn thành" },
  PROCESSING: { className: "bg-[#3B82F6]/20 text-[#3B82F6]", label: "Đang xử lý" },
  PENDING: { className: "bg-[#F59E0B]/20 text-[#F59E0B]", label: "Chờ" },
  FAILED: { className: "bg-[#EF4444]/20 text-[#EF4444]", label: "Thất bại" },
  REFUNDED: { className: "bg-[#A855F7]/20 text-[#A855F7]", label: "Hoàn tiền" },
};

const statusBorderClass: Record<string, string> = {
  SUCCESS: "border-[#22C55E] text-[#22C55E]",
  COMPLETED: "border-[#22C55E] text-[#22C55E]",
  PROCESSING: "border-[#3B82F6] text-[#3B82F6]",
  PENDING: "border-[#F59E0B] text-[#F59E0B]",
  FAILED: "border-[#EF4444] text-[#EF4444]",
  REFUNDED: "border-[#A855F7] text-[#A855F7]",
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("all");
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const { data: orders = [], isLoading, error, refetch } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const filtered = filter === "all"
    ? orders
    : filter === "PRODUCT"
    ? orders.filter((o) => o.type === "PRODUCT")
    : filter === "SERVICE"
    ? orders.filter((o) => o.type === "SERVICE")
    : orders.filter((o) => o.status === filter);

  const handleStatusChange = (id: string, type: string, newStatus: string) => {
    if (!confirm("Đổi trạng thái đơn hàng?")) return;
    updateStatus.mutate({ id, type, status: newStatus });
  };

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
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 rounded-[8px] border border-[#1E293B] px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#1F2937] transition-all"
            >
              <Loader2 className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { key: "all", label: "Tất cả" },
              { key: "PRODUCT", label: "Sản phẩm" },
              { key: "SERVICE", label: "Dịch vụ" },
              { key: "PENDING", label: "Chờ" },
              { key: "PROCESSING", label: "Đang xử lý" },
              { key: "SUCCESS", label: "Thành công" },
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">Không thể tải đơn hàng</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Mã đơn", "Loại", "Khách hàng", "Sản phẩm/Dịch vụ", "Tổng tiền", "Trạng thái", "Ngày", "Hành động"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filtered.map((order) => {
                      const sc = statusConfig[order.status] || { className: "bg-slate-500/20 text-slate-400", label: order.status };
                      const borderClass = statusBorderClass[order.status] || "border-slate-500 text-slate-400";
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
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingOrder(order)}
                                className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, order.type, e.target.value)}
                                disabled={updateStatus.isPending}
                                className={`h-7 rounded-[6px] border text-xs px-2 font-medium bg-transparent focus:outline-none cursor-pointer ${borderClass}`}
                              >
                                <option value="PENDING">Chờ</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="SUCCESS">Thành công</option>
                                <option value="FAILED">Thất bại</option>
                                <option value="REFUNDED">Hoàn tiền</option>
                              </select>
                            </div>
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

      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">Chi tiết đơn hàng</h2>
                <p className="text-xs text-[#64748B] font-mono">#{viewingOrder.id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <p className="text-xs text-[#64748B] mb-1">Khách hàng</p>
                  <p className="text-sm font-medium text-white">{viewingOrder.user?.username || "N/A"}</p>
                  <p className="text-xs text-[#64748B]">{viewingOrder.user?.email || ""}</p>
                </div>
                <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <p className="text-xs text-[#64748B] mb-1">Loại đơn</p>
                  <Badge className={`text-xs ${viewingOrder.type === "SERVICE" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {viewingOrder.type === "SERVICE" ? "Dịch vụ" : "Sản phẩm"}
                  </Badge>
                </div>
                <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <p className="text-xs text-[#64748B] mb-1">Tong tien</p>
                  <p className="text-sm font-bold text-[#3B82F6]">{formatCurrency(viewingOrder.price)}</p>
                </div>
                <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <p className="text-xs text-[#64748B] mb-1">Trạng thái</p>
                  <Badge className={`text-xs ${statusConfig[viewingOrder.status]?.className || "bg-slate-500/20 text-slate-400"}`}>
                    {statusConfig[viewingOrder.status]?.label || viewingOrder.status}
                  </Badge>
                </div>
                <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <p className="text-xs text-[#64748B] mb-1">Ngay dat</p>
                  <p className="text-sm text-white">{viewingOrder.date}</p>
                </div>
                {viewingOrder.type === "SERVICE" && (
                  <>
                    {viewingOrder.phone && (
                      <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                        <p className="text-xs text-[#64748B] mb-1">Số điện thoại</p>
                        <p className="text-sm text-white">{viewingOrder.phone}</p>
                      </div>
                    )}
                    {viewingOrder.telegram && (
                      <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                        <p className="text-xs text-[#64748B] mb-1">Telegram</p>
                        <p className="text-sm text-white">{viewingOrder.telegram}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {viewingOrder.type === "PRODUCT" && viewingOrder.orderItems && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Sản phẩm</h3>
                  <div className="space-y-2">
                    {viewingOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{item.productName}</p>
                            <p className="text-xs text-[#64748B]">So luong: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-[#94A3B8]">{formatCurrency(item.price)}</p>
                        </div>
                        {item.accountData && (
                          <div className="mt-2 rounded-[8px] bg-green-500/10 border border-green-500/20 p-2">
                            <p className="text-xs text-green-400 font-medium mb-1">Tài khoản:</p>
                            <p className="text-xs text-green-300 font-mono whitespace-pre-wrap">{item.accountData}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingOrder.type === "SERVICE" && (
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Dịch vụ</h3>
                  <div className="rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                    <p className="text-sm font-medium text-white">{viewingOrder.product}</p>
                    <p className="text-xs text-[#64748B] mt-1">Gia: {formatCurrency(viewingOrder.price)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
