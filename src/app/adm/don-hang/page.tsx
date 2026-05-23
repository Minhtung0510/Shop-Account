"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Eye, CheckCircle, XCircle, Clock, ShoppingBag, Loader2 } from "lucide-react";

interface Order {
  id: string;
  type: "PRODUCT" | "SERVICE";
  product: string;
  price: number;
  status: string;
  date: string;
  user: { username: string; email: string };
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý", color: "text-yellow-500" },
  { value: "PROCESSING", label: "Đang xử lý", color: "text-blue-500" },
  { value: "SUCCESS", label: "Thành công", color: "text-green-500" },
  { value: "FAILED", label: "Thất bại", color: "text-red-500" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, type, status }: { id: string; type: string; status: string }) => {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      fetchOrders();
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const handleStatusChange = (id: string, type: string, newStatus: string) => {
    if (confirm(`Đổi trạng thái đơn hàng thành "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id, type, status: newStatus });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "SUCCESS":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Hoàn thành</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-500/10 text-blue-500"><Clock className="h-3 w-3 mr-1" />Đang xử lý</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Đang chờ</Badge>;
      case "CANCELLED":
      case "FAILED":
        return <Badge className="bg-red-500/10 text-red-500"><XCircle className="h-3 w-3 mr-1" />Đã hủy</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">{status}</Badge>;
    }
  };

  const filtered = orders.filter(o => 
    (o.product?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (o.user?.username?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AdminPageLayout title="Đơn hàng" description="Quản lý đơn hàng sản phẩm và dịch vụ">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Tìm kiếm đơn hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-white"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">Không có đơn hàng nào</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.id} className="p-4 rounded-[12px] bg-[#1E293B] border border-[#334155] hover:border-[#6366F1] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-xs">{order.type === "PRODUCT" ? "Sản phẩm" : "Dịch vụ"}</Badge>
                        <span className="text-white font-medium">{order.product || "N/A"}</span>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {order.user?.username || "N/A"} • {order.date}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold text-white">
                          {order.price?.toLocaleString("vi-VN") || 0}đ
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, order.type, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className="h-8 rounded-[6px] border border-[#334155] bg-[#1E293B] text-xs px-2 text-white focus:outline-none focus:border-[#6366F1] cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
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
