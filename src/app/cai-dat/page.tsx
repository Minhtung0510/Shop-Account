"use client";

import { useSession } from "@/hooks/useSession";
import { useUserStore } from "@/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Wallet,
  ShoppingBag,
  CreditCard,
  Calendar,
  Star,
  Edit,
  Check,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const stats = [
  { label: "Số dư", value: "0đ", icon: Wallet, color: "text-[#3B82F6]" },
  { label: "Tổng đơn hàng", value: "0", icon: ShoppingBag, color: "text-[#22C55E]" },
  { label: "Tổng nạp tiền", value: "0đ", icon: CreditCard, color: "text-[#F59E0B]" },
  { label: "Mua gần nhất", value: "Chưa có", icon: Calendar, color: "text-[#06B6D4]" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const userFromStore = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#3B82F6] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const userStats = [
    { label: "Số dư", value: formatCurrency(userFromStore?.balance ?? session.user.balance), icon: Wallet, color: "text-[#3B82F6]" },
    { label: "Tổng đơn hàng", value: "0", icon: ShoppingBag, color: "text-[#22C55E]" },
    { label: "Tổng nạp tiền", value: "0đ", icon: CreditCard, color: "text-[#F59E0B]" },
    { label: "Mua gần nhất", value: "Chưa có", icon: Calendar, color: "text-[#06B6D4]" },
  ];

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setEditing(false);
    setLoading(false);
    toast.success("Cập nhật thông tin thành công!");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="!rounded-[18px] overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]" />
            <CardContent className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-[18px] overflow-hidden border-4 border-[#111827] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{session.user.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <Badge className="absolute -bottom-1 -right-1 bg-[#F59E0B] text-white border-0">
                    {session.user.rank || "Member"}
                  </Badge>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-sora text-2xl font-bold text-white">{session.user.name}</h1>
                  <p className="text-[#94A3B8] text-sm">{session.user.email}</p>
                  <p className="text-xs text-[#64748B] mt-1">UID: {session.user.id?.slice(-6).toUpperCase() || "ABC123"}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                  Chỉnh sửa
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {userStats.map((stat) => (
                <Card key={stat.label} className="!rounded-[16px]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="font-sora text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-[#64748B]">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Account Info */}
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-white">Thông tin tài khoản</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? (
                    <>
                      <X className="h-3 w-3" /> Hủy
                    </>
                  ) : (
                    <>
                      <Edit className="h-3 w-3" /> Sửa
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <User className="h-3 w-3" /> Tên đăng nhập
                    </label>
                    {editing ? (
                      <Input defaultValue={session.user.name} />
                    ) : (
                      <p className="text-white font-medium">{session.user.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </label>
                    <p className="text-white font-medium">{session.user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Số điện thoại
                    </label>
                    <p className="text-white font-medium">Chưa cập nhật</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Ngày tạo
                    </label>
                    <p className="text-white font-medium">-</p>
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      {loading ? (
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      Lưu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white">Bảo mật</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-[#94A3B8]" />
                    <div>
                      <p className="text-sm font-medium text-white">Đổi mật khẩu</p>
                      <p className="text-xs text-[#64748B]">Cập nhật mật khẩu mới</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Đổi</Button>
                </div>
                <div className="flex items-center justify-between rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-[#94A3B8]" />
                    <div>
                      <p className="text-sm font-medium text-white">Bảo mật 2 lớp (2FA)</p>
                      <p className="text-xs text-[#64748B]">Bảo vệ tài khoản với xác thực 2 bước</p>
                    </div>
                  </div>
                  <Badge variant="outline">Tắt</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white text-sm">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                <Link href="/nap-tien">
                  <Button variant="outline" className="w-full justify-start">
                    <Wallet className="h-4 w-4" />
                    Nạp tiền
                  </Button>
                </Link>
                <Link href="/lich-su">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4" />
                    Lịch sử đơn hàng
                  </Button>
                </Link>
                <Link href="/tai-khoan">
                  <Button className="w-full justify-start">
                    <Star className="h-4 w-4" />
                    Mua tài khoản
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="!rounded-[16px]">
              <CardContent className="p-5">
                <div className="text-center">
                  <Shield className="h-10 w-10 text-[#3B82F6] mx-auto mb-3" />
                  <h3 className="font-sora font-semibold text-white mb-2">Cần hỗ trợ?</h3>
                  <p className="text-xs text-[#64748B] mb-4">
                    Liên hệ đội ngũ hỗ trợ 24/7 nếu bạn gặp vấn đề
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Liên hệ hỗ trợ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
