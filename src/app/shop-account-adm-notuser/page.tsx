import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  ShoppingBag,
  Banknote,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const [totalUsers, totalOrders, monthlyRevenue, todayOrders, recentOrders, successCount, processingCount, failedCount, pendingCount, topUsers] =
    await Promise.all([
      db.user.count({ where: { role: "USER" } }),
      db.order.count(),
      db.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: "SUCCESS" },
        _sum: { totalAmount: true },
      }),
      db.order.count({ where: { createdAt: { gte: startOfToday } } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { username: true } } },
      }),
      db.order.count({ where: { status: "SUCCESS" } }),
      db.order.count({ where: { status: "PROCESSING" } }),
      db.order.count({ where: { status: "FAILED" } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.user.findMany({
        where: { role: "USER" },
        select: { id: true, username: true, _count: { select: { orders: true } } },
        orderBy: { orders: { _count: "desc" } },
        take: 5,
      }),
    ]);

  return {
    stats: {
      totalUsers,
      totalOrders,
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      todayOrders,
      usersChange: 12,
      ordersChange: 8,
      revenueChange: 23,
      todayOrdersChange: 15,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      user: o.user,
    })),
    orderStats: { success: successCount, processing: processingCount, failed: failedCount, pending: pendingCount },
    topUsers: topUsers.map((u) => ({ id: u.id, username: u.username, orderCount: u._count.orders })),
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const data = await getDashboardData();

  const stats = [
    { title: "Tổng người dùng", value: data.stats.totalUsers.toLocaleString(), change: `+${data.stats.usersChange}%`, trend: "up" as const, icon: Users },
    { title: "Tổng đơn hàng", value: data.stats.totalOrders.toLocaleString(), change: `+${data.stats.ordersChange}%`, trend: "up" as const, icon: ShoppingBag },
    { title: "Doanh thu tháng", value: formatCurrency(data.stats.monthlyRevenue), change: `+${data.stats.revenueChange}%`, trend: "up" as const, icon: Banknote },
    { title: "Đơn hàng hôm nay", value: data.stats.todayOrders.toString(), change: `+${data.stats.todayOrdersChange}%`, trend: "up" as const, icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#020617]">
      <AdminSidebar />

      <div className="ml-[240px]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E293B] bg-[#020617] px-6 h-16">
          <div>
            <h1 className="text-lg font-bold text-white">Tổng quan</h1>
            <p className="text-xs text-[#64748B]">Xem tổng quan hệ thống</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-[#64748B]">{stat.title}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#6366F1]/10">
                      <stat.icon className="h-4 w-4 text-[#6366F1]" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-[#10B981]" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-[#EF4444]" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === "up" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-[#64748B]">vs tháng trước</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
                <div className="flex items-center justify-between p-5 pb-3 border-b border-[#1E293B]">
                  <h2 className="text-sm font-semibold text-white">Đơn hàng gần đây</h2>
                  <Badge className="bg-[#6366F1]/15 text-[#6366F1] text-[10px] px-2">Mới nhất</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#1E293B]">
                          {["Mã đơn", "Khách hàng", "Tổng tiền", "Trạng thái", "Ngày tạo"].map((h) => (
                            <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase text-[#64748B]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]">
                        {data.recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#1E293B]/30 transition-colors">
                            <td className="px-5 py-3">
                              <span className="font-mono text-xs text-[#6366F1]">{order.id.slice(-8).toUpperCase()}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-sm text-white">{order.user.username}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount)}</span>
                            </td>
                            <td className="px-5 py-3">
                              <Badge className={`text-xs ${
                                order.status === "SUCCESS" ? "bg-[#10B981]/15 text-[#10B981]" :
                                order.status === "PROCESSING" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                                order.status === "PENDING" ? "bg-[#6366F1]/15 text-[#6366F1]" :
                                "bg-[#EF4444]/15 text-[#EF4444]"
                              }`}>
                                {order.status === "SUCCESS" ? "Thành công" :
                                 order.status === "PROCESSING" ? "Đang xử lý" :
                                 order.status === "PENDING" ? "Chờ thanh toán" : "Thất bại"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs text-[#64748B]">
                                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {data.recentOrders.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-sm text-[#64748B]">
                              Chưa có đơn hàng nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
                <div className="p-5 pb-3 border-b border-[#1E293B]">
                  <h2 className="text-sm font-semibold text-white">Trạng thái đơn hàng</h2>
                </div>
                <CardContent className="p-5 space-y-3">
                  {[
                    { label: "Thành công", count: data.orderStats.success, bg: "bg-[#10B981]" },
                    { label: "Đang xử lý", count: data.orderStats.processing, bg: "bg-[#F59E0B]" },
                    { label: "Thất bại", count: data.orderStats.failed, bg: "bg-[#EF4444]" },
                    { label: "Chờ thanh toán", count: data.orderStats.pending, bg: "bg-[#6366F1]" },
                  ].map((status) => (
                    <div key={status.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${status.bg}`} />
                        <span className="text-sm text-[#94A3B8]">{status.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{status.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
                <div className="flex items-center justify-between p-5 pb-3 border-b border-[#1E293B]">
                  <h2 className="text-sm font-semibold text-white">Top người dùng</h2>
                  <Badge className="bg-[#10B981]/15 text-[#10B981] text-[10px] px-2">Tháng này</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-[#1E293B]">
                    {data.topUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#1E293B]/30 transition-colors">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          index === 0 ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                          index === 1 ? "bg-[#94A3B8]/20 text-[#94A3B8]" :
                          index === 2 ? "bg-[#CD7F32]/20 text-[#CD7F32]" :
                          "bg-[#1E293B] text-[#64748B]"
                        }`}>
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.username}</p>
                        </div>
                        <span className="text-xs text-[#64748B]">{user.orderCount} đơn</span>
                      </div>
                    ))}
                    {data.topUsers.length === 0 && (
                      <div className="px-5 py-4 text-center text-sm text-[#64748B]">
                        Chưa có người dùng
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
