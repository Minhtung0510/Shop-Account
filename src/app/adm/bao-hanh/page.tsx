"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";

interface Warranty {
  id: string;
  productName: string;
  orderId: string;
  issue: string;
  status: string;
  user: { username: string; email: string };
  createdAt: string;
}

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWarranties = async () => {
    try {
      const res = await fetch("/api/admin/warranties");
      if (res.ok) {
        const data = await res.json();
        setWarranties(data.warranties || []);
      }
    } catch (error) {
      console.error("Failed to fetch warranties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Hoàn thành</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="h-3 w-3 mr-1" />Từ chối</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">{status}</Badge>;
    }
  };

  return (
    <AdminPageLayout title="Bảo hành" description="Quản lý yêu cầu bảo hành">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-end">
            <Button variant="outline" size="sm" onClick={fetchWarranties}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[#64748B]">Đang tải...</div>
          ) : warranties.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">Không có yêu cầu bảo hành nào</div>
          ) : (
            <div className="space-y-3">
              {warranties.map((w) => (
                <div key={w.id} className="p-4 rounded-[12px] bg-[#1E293B] border border-[#334155]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-5 w-5 text-[#6366F1]" />
                        <span className="text-white font-medium">{w.productName}</span>
                        {getStatusBadge(w.status)}
                      </div>
                      <p className="text-sm text-[#64748B] mb-1">Vấn đề: {w.issue}</p>
                      <p className="text-xs text-[#64748B]">
                        {w.user.username} • {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    {w.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                          <XCircle className="h-4 w-4" />
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
