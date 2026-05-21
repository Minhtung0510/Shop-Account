"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  QrCode,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface TopupRecord {
  id: string;
  amount: number;
  bankCode: string;
  transferContent: string;
  status: string;
  verifiedAt: string | null;
  createdAt: string;
}

export default function TopupHistoryPage() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<TopupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/topup");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchHistory();
    }
  }, [mounted]);

  const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    PENDING: { label: "Đang chờ", className: "bg-[#F59E0B]/20 text-[#F59E0B]", icon: Clock },
    APPROVED: { label: "Thành công", className: "bg-[#22C55E]/20 text-[#22C55E]", icon: CheckCircle },
    REJECTED: { label: "Từ chối", className: "bg-[#EF4444]/20 text-[#EF4444]", icon: XCircle },
    CANCELLED: { label: "Đã hủy", className: "bg-[#64748B]/20 text-[#64748B]", icon: XCircle },
  };

  const totalDeposited = records
    .filter((r) => r.status === "APPROVED")
    .reduce((sum, r) => sum + r.amount, 0);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-sora text-xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[900px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/nap-tien" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Link>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <h1 className="font-sora text-3xl font-bold text-white mb-2">Lịch sử nạp tiền</h1>
        <p className="text-[#94A3B8] mb-8">Xem lại các giao dịch nạp tiền của bạn</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="!rounded-[16px]">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#22C55E]/20">
                  <Wallet className="h-5 w-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Tổng đã nạp</p>
                  <p className="font-sora text-lg font-bold text-white">{formatCurrency(totalDeposited)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="!rounded-[16px]">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#3B82F6]/20">
                  <RefreshCw className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B]">Tổng giao dịch</p>
                  <p className="font-sora text-lg font-bold text-white">{records.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick topup */}
        <div className="mb-6">
          <Link href="/nap-tien">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nạp thêm tiền
            </Button>
          </Link>
        </div>

        {/* History list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-[#1F2937] p-6">
              <Wallet className="h-12 w-12 text-[#334155]" />
            </div>
            <h3 className="font-sora text-lg font-semibold text-white mb-2">Chưa có giao dịch nạp tiền</h3>
            <p className="text-sm text-[#64748B] mb-6">Hãy nạp tiền để mua sản phẩm</p>
            <Link href="/nap-tien">
              <Button>
                <QrCode className="h-4 w-4" />
                Nạp tiền ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => {
              const cfg = statusConfig[record.status] || statusConfig.PENDING;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="!rounded-[16px]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${
                            record.status === "APPROVED" ? "bg-[#22C55E]/20" :
                            record.status === "PENDING" ? "bg-[#F59E0B]/20" :
                            record.status === "REJECTED" ? "bg-[#EF4444]/20" :
                            "bg-[#64748B]/20"
                          }`}>
                            <StatusIcon className={`h-5 w-5 ${
                              record.status === "APPROVED" ? "text-[#22C55E]" :
                              record.status === "PENDING" ? "text-[#F59E0B]" :
                              record.status === "REJECTED" ? "text-[#EF4444]" :
                              "text-[#64748B]"
                            }`} />
                          </div>
                          <div>
                            <p className="font-sora font-semibold text-white">
                              {formatCurrency(record.amount)}
                            </p>
                            <p className="text-sm text-[#64748B]">
                              {record.bankCode} • {new Date(record.createdAt).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>
                      {record.transferContent && (
                        <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#0F172A] px-3 py-2">
                          <span className="text-xs text-[#64748B]">Nội dung CK:</span>
                          <span className="font-mono text-sm text-[#F59E0B]">{record.transferContent}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
