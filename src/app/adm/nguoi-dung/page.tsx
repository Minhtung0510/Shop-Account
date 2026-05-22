"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Loader2,
  X,
  Shield,
  ShieldOff,
  Edit2,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  Crown,
  UserCog,
  UserCheck,
  User,
} from "lucide-react";
import { useAdminUsers, useUpdateUser, useDeleteUser } from "@/hooks/useAdmin";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
  balance: number;
  rank: string;
  orders: number;
  isLocked: boolean;
  lockedAt: string | null;
  created: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; level: number }> = {
  SUPER_ADMIN: { label: "Chủ Shop", icon: Crown, color: "text-[#EF4444]", bg: "bg-[#EF4444]/20", level: 1 },
  ADMIN: { label: "Quản trị", icon: Shield, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/20", level: 2 },
  MODERATOR: { label: "Điều hành", icon: UserCog, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/20", level: 3 },
  STAFF: { label: "Nhân viên", icon: UserCheck, color: "text-[#10B981]", bg: "bg-[#10B981]/20", level: 4 },
  USER: { label: "Người dùng", icon: User, color: "text-[#64748B]", bg: "bg-[#64748B]/20", level: 5 },
};

function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    username: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "USER",
    balance: user.balance?.toString() || "0",
    rank: user.rank || "Bronze",
  });
  const updateUser = useUpdateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate(
      { id: user.id, ...form, balance: parseFloat(form.balance) },
      {
        onSuccess: () => {
          onSave();
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[16px] border border-[#1E293B] bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <h2 className="text-lg font-bold text-white">Chỉnh sửa người dùng</h2>
          <button
            onClick={onClose}
            className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {updateUser.isError && (
            <div className="rounded-[8px] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              Có lỗi xảy ra
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Email</label>
            <input
              value={form.email}
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Số dư (VND)</label>
            <input
              value={form.balance}
              type="number"
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Vai trò</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AdminUser["role"] })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            >
              {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                <option key={role} value={role}>
                  {config.level} - {config.label} ({role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Hạng</label>
            <select
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            >
              {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: users = [], isLoading, error, refetch, isFetching } = useAdminUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleToggleRole = (user: AdminUser) => {
    const roles = ["USER", "STAFF", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
    const currentIndex = roles.indexOf(user.role);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    
    if (!confirm(`Đổi vai trò từ "${ROLE_CONFIG[user.role]?.label}" thành "${ROLE_CONFIG[nextRole]?.label}"?`)) return;
    updateUser.mutate(
      { id: user.id, role: nextRole },
      { onSuccess: () => refetch() }
    );
  };

  const handleToggleLock = (user: AdminUser) => {
    const action = user.isLocked ? "mở khoá" : "khoá";
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${user.name}"?`)) return;
    updateUser.mutate(
      { id: user.id, isLocked: !user.isLocked },
      { onSuccess: () => refetch() }
    );
  };

  const handleDelete = (user: AdminUser) => {
    if (user.role === "SUPER_ADMIN") {
      alert("Không thể xóa Super Admin!");
      return;
    }
    if (!confirm(`Xóa tài khoản "${user.name}"? Hành động không thể hoàn tác.`)) return;
    deleteUser.mutate(user.id, { onSuccess: () => refetch() });
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Người dùng</h1>
              <p className="text-sm text-[#64748B]">{users.length} người dùng</p>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">Không thể tải người dùng</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Người dùng", "Vai trò", "Số dư", "Đơn hàng", "Trạng thái", "Hạng", "Thao tác"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filtered.map((user) => {
                      const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.USER;
                      const RoleIcon = roleConfig.icon;

                      return (
                        <tr key={user.id} className="hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                                <span className="text-sm font-bold text-white">{user.name[0]?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-[#64748B]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${roleConfig.bg} ${roleConfig.color} text-xs gap-1`}>
                              <RoleIcon className="h-3 w-3" />
                              {roleConfig.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-sora text-sm font-bold text-[#3B82F6]">{formatCurrency(user.balance)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white">{user.orders}</span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-xs ${user.isLocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                              {user.isLocked ? "Bị khoá" : "Bình thường"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#94A3B8]">{user.rank}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditing(user); setShowModal(true); }}
                                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors" title="Chỉnh sửa">
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleToggleLock(user)}
                                className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${user.isLocked ? "text-green-400 hover:bg-green-500/10" : "text-orange-400 hover:bg-orange-500/10"}`} title={user.isLocked ? "Mở khoá" : "Khoá"}>
                                {user.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </button>
                              <button onClick={() => handleToggleRole(user)}
                                className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${roleConfig.color} hover:${roleConfig.bg}`} title="Đổi vai trò">
                                {user.role === "SUPER_ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                              </button>
                              <button onClick={() => handleDelete(user)}
                                className="flex h-8 w-8 items-center justify-center rounded-[8px] text-red-400 hover:bg-red-500/10 transition-colors" title="Xóa">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">
                    {search ? "Không tìm thấy người dùng nào" : "Chưa có người dùng nào"}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showModal && editing && (
        <EditUserModal
          user={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={() => refetch()}
        />
      )}
    </div>
  );
}
