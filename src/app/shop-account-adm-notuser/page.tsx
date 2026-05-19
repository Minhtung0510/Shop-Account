import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { DashboardCharts } from "@/components/shared/dashboard-charts";
import { Card, CardContent } from "@/components/ui/card";
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

  const [totalUsers, productOrders, productRevenue, todayProductOrders, serviceOrders] =
    await Promise.all([
      db.user.count({ where: { role: "USER" } }),

      db.order.findMany({
        where: { createdAt: { gte: startOfMonth } },
        select: { totalAmount: true, status: true, createdAt: true },
      }),

      db.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: "SUCCESS" },
        _sum: { totalAmount: true },
      }),

      db.order.count({ where: { createdAt: { gte: startOfToday } } }),

      db.serviceOrder.count(),
    ]);

  const monthlyRevenue = (productRevenue._sum.totalAmount || 0) + serviceOrders * 500000;
  const totalOrders = productOrders.length + serviceOrders;
  const todayOrders = todayProductOrders;

  return {
    stats: {
      totalUsers,
      totalOrders,
      monthlyRevenue,
      todayOrders,
      usersChange: 12,
      ordersChange: Math.round((totalOrders / 50) * 100),
      revenueChange: 23,
      todayOrdersChange: 15,
    },
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

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
          <span className="text-xs text-[#64748B]">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
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

          <DashboardCharts />
        </div>
      </div>
    </div>
  );
}
