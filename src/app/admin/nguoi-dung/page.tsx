"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-users";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />

      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Người dùng</h1>
              <p className="text-sm text-[#64748B]">Quản lý tài khoản người dùng</p>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Thêm admin
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="flex gap-3">
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
          </div>

          {/* Users Table */}
          <Card className="!rounded-[16px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E293B]">
                    {["Người dùng", "Vai trò", "Số dư", "Mật khẩu", "Đơn hàng", "Hạng", "Ngày tạo", "Thao tác"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {MOCK_USERS.map((user) => (
                    <tr key={user.id} className="hover:bg-[#1F2937]/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                            <span className="text-sm font-bold text-white">{user.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-[#64748B]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === "ADMIN" ? "purple" : "outline"} className="text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-sora text-sm font-bold text-[#3B82F6]">{formatCurrency(user.balance)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-[#94A3B8]">{user.password}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{user.orders}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.rank === "Platinum" ? "purple" : user.rank === "Gold" ? "warning" : "secondary"} className="text-xs">
                          {user.rank}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#64748B]">{user.created}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors">
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors">
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
