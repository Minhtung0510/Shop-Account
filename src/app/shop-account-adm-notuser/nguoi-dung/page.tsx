"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search, Loader2, X, Shield, ShieldOff, Edit2, RefreshCw } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  balance: number;
  rank: string;
  orders: number;
  created: string;
}

function EditUserModal({ user, onClose, onSave }: { user?: AdminUser; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    username: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "USER",
    balance: user?.balance?.toString() || "0",
    rank: user?.rank || "Bronze",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...form, balance: parseFloat(form.balance) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Lỗi");
      } else {
        onSave();
        onClose();
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[16px] border border-[#1E293B] bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <h2 className="text-lg font-bold text-white">Chinh sua nguoi dung</h2>
          <button onClick={onClose} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-[8px] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Username</label>
            <input value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Email</label>
            <input value={form.email} type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">So du (VND)</label>
            <input value={form.balance} type="number"
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Vai tro</label>
            <select value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Hang</label>
            <select value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none">
              {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Huy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Luu thay doi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setUsers)
      .catch(() => setError("Khong the tai nguoi dung"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleRole = async (user: AdminUser) => {
    if (!confirm(`Ban co chan muon ${user.role === "ADMIN" ? "go quyen ADMIN" : "nang cap thanh ADMIN"} cho ${user.name}?`)) return;
    setActionLoading(user.id);
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role: user.role === "ADMIN" ? "USER" : "ADMIN" }),
      });
      fetchUsers();
    } catch {
      alert("Loi");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) =>
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
              <h1 className="font-sora text-xl font-bold text-white">Nguoi dung</h1>
              <p className="text-sm text-[#64748B]">{users.length} nguoi dung</p>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <input type="text" placeholder="Tim kiem nguoi dung..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" />
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers}><RefreshCw className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" /></div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Nguoi dung", "Vai tro", "So du", "Don hang", "Hang", "Ngay tao", "Thao tac"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-[#1F2937]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                              <span className="text-sm font-bold text-white">{user.name[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user.name}</p>
                              <p className="text-xs text-[#64748B]">{user.email}</p>
                              {user.phone && <p className="text-xs text-[#64748B]">{user.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${user.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-slate-500/20 text-slate-400"}`}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-sora text-sm font-bold text-[#3B82F6]">{formatCurrency(user.balance)}</span>
                        </td>
                        <td className="px-4 py-3"><span className="text-sm text-white">{user.orders}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-[#94A3B8]">{user.rank}</span></td>
                        <td className="px-4 py-3"><span className="text-sm text-[#64748B]">{user.created}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditing(user); setShowModal(true); }}
                              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors"
                              title="Chinh sua"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleRole(user)}
                              disabled={actionLoading === user.id}
                              className={`flex h-8 w-8 items-center justify-center rounded-[8px] transition-colors ${
                                user.role === "ADMIN"
                                  ? "text-red-400 hover:bg-red-500/10"
                                  : "text-green-400 hover:bg-green-500/10"
                              }`}
                              title={user.role === "ADMIN" ? "Go quyen admin" : "Nang cap admin"}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.role === "ADMIN" ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <Shield className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">
                    {search ? "Khong tim thay nguoi dung nao" : "Chua co nguoi dung nao"}
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
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}
