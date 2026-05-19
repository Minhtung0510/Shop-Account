"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CheckCircle, XCircle, RefreshCw, Search, Clock, CheckCheck, X } from "lucide-react";

interface TopupRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  amount: number;
  bankCode: string;
  transferContent: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt: string | null;
  createdAt: string;
  createdFull: string;
}

export default function AdminTopupPage() {
  const [topups, setTopups] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchTopups = () => {
    fetch("/api/admin/topup")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setTopups)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTopups(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const label = action === "approve" ? "xác nhận đã nhận tiền" : "từ chối";
    if (!confirm(`Bạn có chắc muốn ${label} yêu cầu này?`)) return;

    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Lỗi");
      } else {
        setTopups((prev) => prev.map((t) => t.id === id ? {
          ...t,
          status: action === "approve" ? "APPROVED" : "REJECTED",
          verifiedAt: new Date().toISOString(),
        } : t));
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = topups.filter((t) => {
    const matchSearch =
      t.username.toLowerCase().includes(search.toLowerCase()) ||
      t.transferContent.toLowerCase().includes(search.toLowerCase()) ||
      t.amount.toString().includes(search);
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = topups.filter((t) => t.status === "PENDING").length;

  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    PENDING: { label: "Cho duyet", className: "bg-[#F59E0B]/20 text-[#F59E0B]", icon: Clock },
    APPROVED: { label: "Da duyet", className: "bg-[#22C55E]/20 text-[#22C55E]", icon: CheckCheck },
    REJECTED: { label: "Da tu choi", className: "bg-[#EF4444]/20 text-[#EF4444]", icon: X },
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-sora text-xl font-bold text-white">Nạp tiền</h1>
                <p className="text-sm text-[#64748B]">{topups.length} yêu cầu</p>
              </div>
              {pendingCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 text-xs font-bold animate-pulse">
                  {pendingCount} cho duyet
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchTopups}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-3 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Tim kiem: ten, ma CK, so tien..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-[12px] border border-[#1E293B] bg-[#111827] text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            >
              <option value="ALL">Tat ca</option>
              <option value="PENDING">Cho duyet</option>
              <option value="APPROVED">Da duyet</option>
              <option value="REJECTED">Tu choi</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            <Card className="!rounded-[16px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Ma GD", "Nguoi dung", "Ngan hang", "So tien", "Noi dung CK", "Trang thai", "Ngay", "Thao tac"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filtered.map((t) => {
                      const cfg = statusConfig[t.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={t.id} className={`hover:bg-[#1F2937]/30 transition-colors ${t.status === "PENDING" ? "bg-[#F59E0B]/5" : ""}`}>
                          <td className="px-4 py-3 font-mono text-sm text-[#3B82F6]">{t.id.slice(-8).toUpperCase()}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-white">{t.username}</p>
                              <p className="text-xs text-[#64748B]">{t.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#94A3B8]">{t.bankCode}</td>
                          <td className="px-4 py-3 font-sora font-bold text-white">{formatCurrency(t.amount)}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-[6px]">{t.transferContent}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cfg.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {cfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#64748B]">{t.createdAt}</td>
                          <td className="px-4 py-3">
                            {t.status === "PENDING" ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAction(t.id, "approve")}
                                  disabled={processingId === t.id}
                                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#22C55E] hover:bg-[#22C55E]/10 disabled:opacity-50"
                                  title="Duyet"
                                >
                                  {processingId === t.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAction(t.id, "reject")}
                                  disabled={processingId === t.id}
                                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10 disabled:opacity-50"
                                  title="Tu choi"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-[#475569]">
                                {t.verifiedAt ? `XL: ${new Date(t.verifiedAt).toLocaleString("vi-VN")}` : "-"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Clock className="h-10 w-10 text-[#334155] mb-3" />
                    <p className="text-[#64748B]">
                      {search || statusFilter !== "ALL"
                        ? "Khong tim thay yeu cau nao"
                        : "Chua co yeu cau nap tien nao"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
