"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Banknote, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface Topup {
  id: string;
  amount: number;
  bankCode: string;
  transferContent: string;
  status: string;
  user: { username: string; email: string };
  createdAt: string;
}

export default function TopupPage() {
  const [topups, setTopups] = useState<Topup[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchTopups = async () => {
    try {
      const res = await fetch("/api/admin/topup");
      if (res.ok) {
        const data = await res.json();
        const topupData = Array.isArray(data) ? data : (data.transactions || []);
        setTopups(topupData.map((t: Topup & { user?: { username: string; email: string }; username?: string; email?: string }) => ({
          ...t,
          user: t.user || { username: t.username || "N/A", email: t.email || "" }
        })));
      }
    } catch (error) {
      console.error("Failed to fetch topups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      fetchTopups();
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/topup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      fetchTopups();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "APPROVED":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Thành công</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">{status}</Badge>;
    }
  };

  const handleApprove = (id: string) => {
    if (confirm("Duyệt yêu cầu nạp tiền này?")) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    if (confirm("Từ chối yêu cầu nạp tiền này?")) {
      rejectMutation.mutate(id);
    }
  };

  return (
    <AdminPageLayout title="Nạp tiền" description="Quản lý yêu cầu nạp tiền">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={fetchTopups} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : topups.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">Không có yêu cầu nạp tiền nào</div>
          ) : (
            <div className="space-y-3">
              {topups.map((topup) => (
                <div key={topup.id} className="p-4 rounded-[12px] bg-[#1E293B] border border-[#334155]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Banknote className="h-5 w-5 text-green-500" />
                        <span className="text-xl font-bold text-green-500">
                          +{topup.amount.toLocaleString("vi-VN")}đ
                        </span>
                        {getStatusBadge(topup.status)}
                      </div>
                      <p className="text-sm text-[#64748B] mb-1">
                        Người dùng: {topup.user.username}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        Ngân hàng: {topup.bankCode} • Nội dung: {topup.transferContent}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {new Date(topup.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    {topup.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          onClick={() => handleApprove(topup.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          {approveMutation.isPending && rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          onClick={() => handleReject(topup.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                          {approveMutation.isPending && rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
