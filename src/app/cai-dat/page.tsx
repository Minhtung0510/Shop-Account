"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { useUserProfile, useUserStats, useUpdateProfile, useChangePassword } from "@/hooks/useData";
import { useUserStore } from "@/store";
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
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Chưa có";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePassword = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      toast.success("Đổi mật khẩu thành công!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="!rounded-[20px]">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-[#3B82F6]/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Đổi mật khẩu</CardTitle>
                <p className="text-xs text-[#64748B]">Cập nhật mật khẩu mới cho tài khoản</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#64748B] hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#64748B] flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#64748B] flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#64748B] flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-[10px] border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-3">
                <AlertCircle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <p className="text-xs text-[#F59E0B]">
                  Sau khi đổi mật khẩu thành công, bạn sẽ cần đăng nhập lại.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1" disabled={changePassword.isPending}>
                  {changePassword.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Xác nhận
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const updateProfile = useUpdateProfile();
  const setUserStore = useUserStore((s) => s.setUser);

  const [editing, setEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (sessionStatus === "loading" || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const user = profile;
  const userStats = [
    {
      label: "Số dư",
      value: formatCurrency(stats?.balance ?? user?.balance ?? 0),
      icon: Wallet,
      color: "text-[#3B82F6]",
    },
    {
      label: "Tổng đơn hàng",
      value: String(stats?.totalOrders ?? 0),
      icon: ShoppingBag,
      color: "text-[#22C55E]",
    },
    {
      label: "Tổng nạp tiền",
      value: formatCurrency(stats?.topupTotal ?? 0),
      icon: CreditCard,
      color: "text-[#F59E0B]",
    },
    {
      label: "Mua gần nhất",
      value: formatDate(stats?.lastOrder ?? null),
      icon: Calendar,
      color: "text-[#06B6D4]",
    },
  ];

  const startEditing = () => {
    setEditUsername(user?.username ?? user?.name ?? "");
    setEditPhone(user?.phone ?? "");
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      toast.error("Tên không được để trống");
      return;
    }
    if (editPhone && !/^[0-9]{10,11}$/.test(editPhone.replace(/\s/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    try {
      const result = await updateProfile.mutateAsync({
        username: editUsername.trim(),
        phone: editPhone.trim() || undefined,
      });
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        useUserStore.getState().setUser({
          ...currentUser,
          name: result.username,
        });
      }
      setEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  const isLoading = profileLoading || statsLoading;

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
                    <span className="text-3xl font-bold text-white">
                      {(user?.username ?? user?.name ?? "?")[0]?.toUpperCase()}
                    </span>
                  </div>
                  <Badge className="absolute -bottom-1 -right-1 bg-[#F59E0B] text-white border-0">
                    {user?.rank ?? "Bronze"}
                  </Badge>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="font-sora text-2xl font-bold text-white">
                    {user?.username ?? user?.name ?? "..."}
                  </h1>
                  <p className="text-[#94A3B8] text-sm">{user?.email ?? "..."}</p>
                  <p className="text-xs text-[#64748B] mt-1">
                    UID: {user?.id?.slice(-6).toUpperCase() ?? "------"}
                  </p>
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Edit className="h-3 w-3" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
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
                      <Input
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Nhập tên đăng nhập"
                      />
                    ) : (
                      <p className="text-white font-medium">{user?.username ?? "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </label>
                    <p className="text-white font-medium">{user?.email ?? "—"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Số điện thoại
                    </label>
                    {editing ? (
                      <Input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <p className="text-white font-medium">{user?.phone || "Chưa cập nhật"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#64748B] flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Ngày tạo
                    </label>
                    <p className="text-white font-medium">{formatDate(user?.createdAt ?? null)}</p>
                  </div>
                </div>

                {editing && (
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
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
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                    Đổi
                  </Button>
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
                  <Link href="/lien-he">
                    <Button variant="outline" size="sm" className="w-full">
                      Liên hệ hỗ trợ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
