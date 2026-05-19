"use client";

import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

export default function AdminTopupPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <h1 className="font-sora text-xl font-bold text-white">Nạp tiền</h1>
          <p className="text-sm text-[#64748B]">Quản lý yêu cầu nạp tiền</p>
        </div>
        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E293B]">
                    {["Mã GD", "Người dùng", "Ngân hàng", "Số tiền", "Nội dung CK", "Trạng thái", "Ngày", "Thao tác"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  <tr className="hover:bg-[#1F2937]/30">
                    <td className="px-4 py-3 font-mono text-sm text-[#3B82F6]">TOP001</td>
                    <td className="px-4 py-3 text-sm text-white">Nguyễn Văn A</td>
                    <td className="px-4 py-3 text-sm text-[#94A3B8]">Vietcombank</td>
                    <td className="px-4 py-3 font-sora font-bold text-white">{formatCurrency(500000)}</td>
                    <td className="px-4 py-3 font-mono text-sm text-[#94A3B8]">UID_ABC123</td>
                    <td className="px-4 py-3"><Badge className="bg-[#F59E0B]/20 text-[#F59E0B]">Chờ duyệt</Badge></td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">2026-05-18</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#22C55E] hover:bg-[#22C55E]/10"><CheckCircle className="h-4 w-4" /></button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10"><XCircle className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
