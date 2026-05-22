"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  RefreshCw,
  Crown,
  UserCog,
  UserCheck,
  User,
} from "lucide-react";
import { PermissionMatrix, PermissionSummary } from "@/components/admin/permission-matrix";
import type { Permission, RoleLevel } from "@/types";

interface Role {
  id: string;
  name: string;
  level: number;
  description: string | null;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
}

const ROLE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  SUPER_ADMIN: { icon: Crown, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
  ADMIN: { icon: Shield, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
  MODERATOR: { icon: UserCog, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  STAFF: { icon: UserCheck, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
  USER: { icon: User, color: "text-[#64748B]", bg: "bg-[#64748B]/10" },
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Chủ Shop",
  ADMIN: "Quản trị viên",
  MODERATOR: "Điều hành viên",
  STAFF: "Nhân viên",
  USER: "Người dùng",
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: 4,
    description: "",
    permissions: [] as Permission[],
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (data.roles) setRoles(data.roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        level: role.level,
        description: role.description || "",
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", level: 4, description: "", permissions: [] });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = editingRole ? `/api/admin/roles/${editingRole.id}` : "/api/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        fetchRoles();
      } else {
        const error = await res.json();
        alert(error.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      alert("Không thể xóa vai trò hệ thống");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { method: "DELETE" });
      if (res.ok) fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const getRoleConfig = (name: string) => {
    return ROLE_ICONS[name] || ROLE_ICONS.USER;
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Quản lý Vai trò</h1>
            <p className="text-[#64748B]">Phân quyền người dùng theo mô hình Shopee</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchRoles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm vai trò
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-[#64748B]">Đang tải...</div>
          ) : roles.length === 0 ? (
            <div className="col-span-full text-center py-8 text-[#64748B]">Không có vai trò nào</div>
          ) : (
            roles.map((role) => {
              const config = getRoleConfig(role.name);
              const Icon = config.icon;

              return (
                <Card
                  key={role.id}
                  className="!rounded-[16px] bg-[#0F172A] border-[#1E293B] hover:border-[#334155] transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-[12px] flex items-center justify-center ${config.bg}`}>
                          <Icon className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{ROLE_LABELS[role.name] || role.name}</CardTitle>
                          <p className="text-xs text-[#64748B] font-mono">{role.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(role)}
                          className="h-8 w-8 p-0 text-[#94A3B8] hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(role)}
                            className="h-8 w-8 p-0 text-[#EF4444] hover:bg-[#EF4444]/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-[#64748B] text-sm mt-3">{role.description || "Không có mô tả"}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#64748B]" />
                        <span className="text-sm text-[#94A3B8]">{role.userCount} người dùng</span>
                      </div>
                      {role.isSystem && (
                        <Badge className="bg-[#6366F1]/10 text-[#6366F1] text-xs">Hệ thống</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 6).map((permission) => (
                        <Badge
                          key={permission}
                          className="bg-[#1E293B] text-[#94A3B8] text-xs font-mono"
                        >
                          {permission.split(":")[1]}
                        </Badge>
                      ))}
                      {role.permissions.length > 6 && (
                        <Badge className="bg-[#1E293B] text-[#64748B] text-xs">
                          +{role.permissions.length - 6}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0F172A] border-[#1E293B] text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block">Tên vai trò</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s/g, "_") })}
                  placeholder="VD: MODERATOR"
                  disabled={editingRole?.isSystem}
                  className="bg-[#1E293B] border-[#334155] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#94A3B8] mb-2 block">Cấp độ</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  disabled={editingRole?.isSystem}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value={1}>1 - Chủ Shop (SUPER_ADMIN)</option>
                  <option value={2}>2 - Quản trị viên (ADMIN)</option>
                  <option value={3}>3 - Điều hành viên (MODERATOR)</option>
                  <option value={4}>4 - Nhân viên (STAFF)</option>
                  <option value={5}>5 - Người dùng (USER)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#94A3B8] mb-2 block">Mô tả</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả vai trò"
                className="bg-[#1E293B] border-[#334155] text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-[#94A3B8]">Phân quyền</label>
                <PermissionSummary permissions={formData.permissions} />
              </div>
              <PermissionMatrix
                permissions={formData.permissions}
                onChange={(perms) => setFormData({ ...formData, permissions: perms })}
                disabled={editingRole?.isSystem}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1E293B] mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || formData.permissions.length === 0 || editingRole?.isSystem}
            >
              {editingRole ? "Lưu thay đổi" : "Tạo vai trò"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
