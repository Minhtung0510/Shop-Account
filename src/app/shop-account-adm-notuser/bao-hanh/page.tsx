"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAdminWarranties, useUpdateWarrantyStatus } from "@/hooks/useAdmin";

const statusConfig: Record<string, { className: string; label: string }> = {
  PENDING: { className: "bg-[#F59E0B]/20 text-[#F59E0B]", label: "Chờ xử lý" },
  APPROVED: { className: "bg-[#22C55E]/20 text-[#22C55E]", label: "Chấp nhận" },
  REJECTED: { className: "bg-[#EF4444]/20 text-[#EF4444]", label: "Từ chối" },
  RESOLVED: { className: "bg-[#3B82F6]/20 text-[#3B82F6]", label: "Đã xử lý" },
};

export default function AdminWarrantyPage() {
  const [filter, setFilter] = useState("all");
  const [noteModal, setNoteModal] = useState<{ id: string; adminNote: string | null; status: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data, isLoading, error, refetch } = useAdminWarranties(filter === "all" ? undefined : filter);
  const updateWarranty = useUpdateWarrantyStatus();

  const warranties = data?.warranties || [];

  const handleNoteOpen = (w: { id: string; adminNote: string | null; status: string }) => {
    setNoteModal(w);
    setNoteText(w.adminNote || "");
    setSelectedStatus(w.status);
  };

  const handleNoteSave = () => {
    if (!noteModal) return;
    updateWarranty.mutate(
      { id: noteModal.id, status: selectedStatus, adminNote: noteText },
      { onSuccess: () => setNoteModal(null) }
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Bảo hành</h1>
              <p className="text-sm text-[#64748B]">Tổng {warranties.length} yêu cầu</p>
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
              { key: "PENDING", label: "Chờ xử lý" },
              { key: "APPROVED", label: "Chấp nhận" },
              { key: "REJECTED", label: "Từ chối" },
              { key: "RESOLVED", label: "Đã xử lý" },
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
              <div className="flex items-center justify-center py-12 text-[#EF4444]">Không thể tải bảo hành</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Khách hàng", "Sản phẩm/Dịch vụ", "Vấn đề", "Trạng thái", "Ghi chú", "Ngày", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {warranties.map((w) => {
                      const sc = statusConfig[w.status] || { className: "bg-slate-500/20 text-slate-400", label: w.status };
                      return (
                        <tr key={w.id} className="hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm text-white">{w.user?.username || "N/A"}</p>
                            <p className="text-xs text-[#64748B]">{w.user?.email || ""}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white line-clamp-1 max-w-[180px] block">{w.productName}</span>
                            <Badge className={`text-xs mt-1 ${w.orderType === "SERVICE" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                              {w.orderType === "SERVICE" ? "Dịch vụ" : "Sản phẩm"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#94A3B8] line-clamp-2 max-w-[200px] block">{w.issue}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${sc.className}`}>{sc.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-[#64748B] max-w-[150px] line-clamp-2 block">
                              {w.adminNote || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#64748B]">
                              {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleNoteOpen(w)}
                              className="h-7 px-2 text-xs border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10"
                            >
                              Xử lý
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {warranties.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">Chưa có yêu cầu bảo hành nào</div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[16px] border border-[#1E293B] bg-[#0F172A] p-5">
            <h2 className="text-lg font-bold text-white mb-4">Xử lý bảo hành</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Trạng thái</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="APPROVED">Chấp nhận</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="RESOLVED">Đã xử lý</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Ghi chú</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none resize-none"
                  placeholder="Ghi chú của admin..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setNoteModal(null)} className="flex-1">Hủy</Button>
                <Button onClick={handleNoteSave} disabled={updateWarranty.isPending} className="flex-1">
                  {updateWarranty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
