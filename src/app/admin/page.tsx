"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { mockOrders, mockTopupHistory } from "@/lib/mock-data";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Tổng doanh thu",
    value: "125,450,000đ",
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
  },
  {
    title: "Tổng người dùng",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    color: "text-[#3B82F6]",
    bg: "bg-[#3B82F6]/10",
  },
  {
    title: "Đơn hàng hôm nay",
    value: "45",
    change: "+23.1%",
    trend: "up",
    icon: ShoppingBag,
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  {
    title: "Số dư hệ thống",
    value: "45,230,000đ",
    change: "-2.3%",
    trend: "down",
    icon: CreditCard,
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
  },
];

const revenueData = [
  { day: "T2", value: 12000000 },
  { day: "T3", value: 15000000 },
  { day: "T4", value: 11000000 },
  { day: "T5", value: 18000000 },
  { day: "T6", value: 22000000 },
  { day: "T7", value: 25000000 },
  { day: "CN", value: 19500000 },
];

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const maxRevenue = Math.max(...revenueData.map((d) => d.value));

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        {/* Header */}
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-[#64748B]">Xem tổng quan hệ thống</p>
            </div>
            <div className="text-sm text-[#64748B]">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="!rounded-[16px]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#64748B] mb-1">{stat.title}</p>
                      <p className="font-sora text-xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[12px] ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 text-[#22C55E]" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-[#EF4444]" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === "up" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-[#64748B]">vs tuần trước</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts & Recent */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  Doanh thu theo ngày
                  <Badge variant="success" className="text-xs">Tuần này</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="flex items-end justify-between h-40 gap-2">
                  {revenueData.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <div
                          className="w-full max-w-[40px] rounded-t-[6px] bg-gradient-to-t from-[#3B82F6] to-[#06B6D4] transition-all hover:opacity-80"
                          style={{ height: `${(day.value / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#64748B]">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#1E293B] pt-3">
                  <span className="text-sm text-[#64748B]">Tổng tuần này</span>
                  <span className="font-sora font-bold text-[#3B82F6]">
                    {formatCurrency(revenueData.reduce((a, b) => a + b.value, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white">Đơn hàng gần đây</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {mockOrders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{order.product}</p>
                        <p className="text-xs text-[#64748B]">{order.id} • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-sora font-bold text-white">{formatCurrency(order.price)}</p>
                        <Badge
                          className={`text-xs ${
                            order.status === "SUCCESS" ? "bg-[#22C55E]/20 text-[#22C55E]" :
                            order.status === "PROCESSING" ? "bg-[#3B82F6]/20 text-[#3B82F6]" :
                            "bg-[#EF4444]/20 text-[#EF4444]"
                          }`}
                        >
                          {order.status === "SUCCESS" ? "Thành công" : order.status === "PROCESSING" ? "Đang xử lý" : "Thất bại"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Topups */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Yêu cầu nạp tiền gần đây</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Mã GD", "Người dùng", "Ngân hàng", "Số tiền", "Trạng thái", "Thao tác"].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {mockTopupHistory.map((topup) => (
                      <tr key={topup.id} className="hover:bg-[#1F2937]/30 transition-colors">
                        <td className="py-3">
                          <span className="font-mono text-sm text-[#3B82F6]">{topup.id}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-white">User_{topup.id.slice(-3)}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-sm text-[#94A3B8]">{topup.bank}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-sora font-bold text-white">{formatCurrency(topup.amount)}</span>
                        </td>
                        <td className="py-3">
                          <Badge className={`text-xs ${
                            topup.status === "APPROVED" ? "bg-[#22C55E]/20 text-[#22C55E]" :
                            topup.status === "PENDING" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                            "bg-[#EF4444]/20 text-[#EF4444]"
                          }`}>
                            {topup.status === "APPROVED" ? "Đã duyệt" : topup.status === "PENDING" ? "Chờ duyệt" : "Từ chối"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {topup.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <button className="text-xs px-2 py-1 rounded-[6px] bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20">Duyệt</button>
                              <button className="text-xs px-2 py-1 rounded-[6px] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20">Từ chối</button>
                            </div>
                          ) : (
                            <span className="text-xs text-[#64748B]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
