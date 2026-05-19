"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  History,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Loader2,
  Copy,
  Shield,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  SUCCESS: { icon: CheckCircle, label: "Thành công", color: "bg-[#22C55E]" },
  COMPLETED: { icon: CheckCircle, label: "Hoàn thành", color: "bg-[#22C55E]" },
  PROCESSING: { icon: Clock, label: "Đang xử lý", color: "bg-[#3B82F6]" },
  PENDING: { icon: Clock, label: "Đang chờ", color: "bg-[#F59E0B]" },
  FAILED: { icon: XCircle, label: "Thất bại", color: "bg-[#EF4444]" },
  REFUNDED: { icon: RefreshCw, label: "Hoàn tiền", color: "bg-[#A855F7]" },
};

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  accountData: string | null;
  product: { name: string; thumbnail: string };
}

interface OrderDetail {
  id: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: OrderItemData[];
}

interface OrderRow {
  id: string;
  type: "PRODUCT" | "SERVICE";
  product: string;
  price: number;
  status: string;
  date: string;
  createdAt: string;
  _detail?: OrderDetail;
}

function OrderExpandedRow({ orderId, type }: { orderId: string; type: "PRODUCT" | "SERVICE" }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (type !== "PRODUCT") {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.ok ? res.json() : null)
      .then(setDetail)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [orderId, type]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Đã copy!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <tr>
      <td colSpan={7} className="px-4 py-0">
        <div className="rounded-[12px] border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-4 mb-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            </div>
          ) : type === "SERVICE" ? (
            <div className="text-center py-2">
              <Zap className="h-8 w-8 text-[#A855F7] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">Đơn dịch vụ — liên hệ admin để được hỗ trợ</p>
            </div>
          ) : detail ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-[#64748B]">Mã đơn: <span className="text-[#3B82F6] font-mono">{detail.id.slice(-8).toUpperCase()}</span></span>
                <span className="text-[#64748B]">Ngày: <span className="text-white">{new Date(detail.createdAt).toLocaleString("vi-VN")}</span></span>
                <span className="text-[#64748B]">Tổng: <span className="text-[#3B82F6] font-bold">{formatCurrency(detail.totalAmount)}</span></span>
              </div>

              {detail.orderItems.map((item) => (
                <div key={item.id} className="rounded-[10px] border border-[#1E293B] bg-[#0F172A] p-3">
                  <div className="flex items-center gap-3 mb-3">
                    {item.product.thumbnail && (
                      <div className="h-8 w-8 rounded-[6px] bg-[#1F2937] overflow-hidden shrink-0">
                        <img src={item.product.thumbnail} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.product.name}</p>
                      <p className="text-xs text-[#64748B]">x{item.quantity} · {formatCurrency(item.price)}</p>
                    </div>
                  </div>

                  {item.accountData ? (
                    <div className="space-y-2">
                      {(() => {
                        let accounts: Array<{ email: string; password: string }> = [];
                        try { accounts = JSON.parse(item.accountData); }
                        catch { accounts = [{ email: item.accountData, password: "" }]; }

                        return accounts.map((acc, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-[8px] bg-[#111827] p-2.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#64748B] shrink-0">Email:</span>
                                <span className="text-sm text-white font-mono truncate">{acc.email}</span>
                              </div>
                              {acc.password && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-[#64748B] shrink-0">Pass:</span>
                                  <span className="text-sm text-white font-mono">{showPass ? acc.password : "••••••••"}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => copyText(acc.email, `${item.id}-e-${i}`)}
                              className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#1E293B] text-[#94A3B8] hover:text-white shrink-0"
                              title="Copy email"
                            >
                              {copiedId === `${item.id}-e-${i}` ? <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            {acc.password && (
                              <button
                                onClick={() => copyText(acc.password, `${item.id}-p-${i}`)}
                                className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#1E293B] text-[#94A3B8] hover:text-white shrink-0"
                                title="Copy password"
                              >
                                {copiedId === `${item.id}-p-${i}` ? <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="rounded-[8px] bg-[#1F2937]/50 p-2 text-center">
                      <p className="text-xs text-[#64748B]">Tài khoản sẽ được gửi qua email sau khi đơn được xử lý</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="rounded-[8px] border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-2">
                <p className="text-xs text-[#F59E0B] flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#64748B] text-center py-2">Không tìm thấy chi tiết đơn hàng</p>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/orders")
        .then((res) => res.ok ? res.json() : [])
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <History className="h-16 w-16 text-[#334155] mb-4" />
        <h2 className="font-sora text-xl font-bold text-white mb-2">Cần đăng nhập</h2>
        <p className="text-[#94A3B8] mb-6">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
        <Button onClick={() => router.push("/login")}>Đăng nhập</Button>
      </div>
    );
  }

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold text-white mb-2">Lịch sử đơn hàng</h1>
          <p className="text-[#94A3B8]">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "SUCCESS", "COMPLETED", "PROCESSING", "PENDING", "FAILED"].map((f) => {
            const cfg = statusConfig[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-all ${
                  filter === f
                    ? cfg ? `${cfg.color} text-white` : "bg-[#3B82F6] text-white"
                    : "border border-[#1E293B] text-[#94A3B8] hover:bg-[#1F2937]"
                }`}
              >
                {f === "all" ? "Tất cả" : cfg?.label || f}
              </button>
            );
          })}
        </div>

        <Card className="!rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E293B]">
                  {["Mã đơn", "Loại", "Sản phẩm/Dịch vụ", "Giá", "Trạng thái", "Ngày mua", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filtered.map((order) => {
                  const cfg = statusConfig[order.status] || { icon: Clock, label: order.status, color: "bg-slate-500" };
                  const StatusIcon = cfg.icon;
                  const isExpanded = expandedId === order.id;

                  return (
                    <>
                      <tr key={order.id} className="hover:bg-[#1F2937]/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-[#3B82F6]">{order.id.slice(-8).toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${order.type === "SERVICE" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                            {order.type === "SERVICE" ? "Dịch vụ" : "Sản phẩm"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white line-clamp-1 max-w-[200px] block">{order.product}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sora text-sm font-bold text-white">{formatCurrency(order.price)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${cfg.color} text-white border-0`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#94A3B8]">{order.date}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
                            title={isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                          >
                            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <OrderExpandedRow orderId={order.id} type={order.type} />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#94A3B8]">Không có đơn hàng nào</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
