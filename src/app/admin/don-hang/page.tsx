"use client";

import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockOrders } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E293B]">
                    {["Mã đơn", "Khách hàng", "Sản phẩm", "Tổng tiền", "Trạng thái", "Ngày", "Thao tác"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#1F2937]/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-[#3B82F6]">{order.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">Nguyễn Văn A</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{order.product}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sora font-bold text-white">{formatCurrency(order.price)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${
                          order.status === "SUCCESS" ? "bg-[#22C55E]/20 text-[#22C55E]" :
                          order.status === "PROCESSING" ? "bg-[#3B82F6]/20 text-[#3B82F6]" :
                          order.status === "FAILED" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                          "bg-[#F59E0B]/20 text-[#F59E0B]"
                        }`}>
                          {order.status === "SUCCESS" ? "Thành công" : order.status === "PROCESSING" ? "Đang xử lý" : order.status === "FAILED" ? "Thất bại" : "Chờ"}
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
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
