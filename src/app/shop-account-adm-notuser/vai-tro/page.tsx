"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "lucide-react";

type Permission = string;

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
}

const PERMISSION_GROUPS: Record<string, { label: string; permissions: Permission[] }> = {
  users: { label: "Người dùng", permissions: ["users:read", "users:create", "users:update", "users:delete"] },
  products: { label: "Sản phẩm", permissions: ["products:read", "products:create", "products:update", "products:delete"] },
  categories: { label: "Danh mục", permissions: ["categories:read", "categories:create", "categories:update", "categories:delete"] },
  orders: { label: "Đơn hàng", permissions: ["orders:read", "orders:update", "orders:delete", "orders:refund"] },
  settings: { label: "Cài đặt", permissions: ["settings:read", "settings:update"] },
  audit_logs: { label: "Nhật ký", permissions: ["audit_logs:read", "audit_logs:delete"] },
  reports: { label: "Báo cáo", permissions: ["reports:read", "reports:export"] },
  roles: { label: "Vai trò", permissions: ["roles:read", "roles:create", "roles:update", "roles:delete"] },
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", permissions: [] as Permission[] });

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
        description: role.description || "",
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: [] });
    }
    setIsDialogOpen(true);
  };

  const handleTogglePermission = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSelectGroup = (groupKey: string, select: boolean) => {
    const groupPermissions = PERMISSION_GROUPS[groupKey].permissions;
    setFormData(prev => ({
      ...prev,
      permissions: select
        ? [...new Set([...prev.permissions, ...groupPermissions])]
        : prev.permissions.filter(p => !groupPermissions.includes(p)),
    }));
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

  return (
    <div className="min-h-screen bg-[#020617]">
      <AdminSidebar />

      <div className="ml-[240px]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E293B] bg-[#020617] px-6 h-16">
          <div>
            <h1 className="text-lg font-bold text-white">Quản lý vai trò</h1>
            <p className="text-xs text-[#64748B]">Phân quyền người dùng</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchRoles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vai trò
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0F172A] border-[#1E293B] text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Tên vai trò</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                      placeholder="VD: MODERATOR"
                      disabled={editingRole?.isSystem}
                      className="bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#94A3B8] mb-2 block">Mô tả</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả vai trò"
                      className="bg-[#1E293B] border-[#334155] text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[#94A3B8] mb-3 block">Phân quyền</label>
                    <div className="space-y-4">
                      {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => {
                        const allSelected = group.permissions.every(p => formData.permissions.includes(p));
                        const someSelected = group.permissions.some(p => formData.permissions.includes(p));

                        return (
                          <div key={groupKey} className="border border-[#1E293B] rounded-[12px] p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white">{group.label}</h4>
                              <button
                                onClick={() => handleSelectGroup(groupKey, !allSelected)}
                                className={`text-xs px-2 py-1 rounded ${
                                  allSelected
                                    ? "bg-[#10B981]/20 text-[#10B981]"
                                    : someSelected
                                    ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                                    : "bg-[#64748B]/20 text-[#64748B]"
                                }`}
                              >
                                {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.permissions.map(permission => {
                                const isSelected = formData.permissions.includes(permission);
                                return (
                                  <button
                                    key={permission}
                                    onClick={() => handleTogglePermission(permission)}
                                    className={`px-3 py-1.5 rounded-[8px] text-xs font-mono flex items-center gap-1.5 transition-all ${
                                      isSelected
                                        ? "bg-[#3B82F6] text-white"
                                        : "bg-[#1E293B] text-[#94A3B8] hover:bg-[#334155]"
                                    }`}
                                  >
                                    {isSelected ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 opacity-50" />}
                                    {permission}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-[#64748B]">
                      Đã chọn: <span className="text-white">{formData.permissions.length}</span> permissions
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.name || formData.permissions.length === 0}>
                    {editingRole ? "Lưu thay đổi" : "Tạo vai trò"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-[#64748B]">Đang tải...</div>
            ) : roles.length === 0 ? (
              <div className="col-span-full text-center py-8 text-[#64748B]">Không có vai trò nào</div>
            ) : (
              roles.map(role => (
                <Card key={role.id} className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center ${
                          role.name === "SUPER_ADMIN"
                            ? "bg-[#EF4444]/10"
                            : role.name === "ADMIN"
                            ? "bg-[#F59E0B]/10"
                            : role.name === "MODERATOR"
                            ? "bg-[#3B82F6]/10"
                            : "bg-[#10B981]/10"
                        }`}>
                          <Shield className={`h-5 w-5 ${
                            role.name === "SUPER_ADMIN"
                              ? "text-[#EF4444]"
                              : role.name === "ADMIN"
                              ? "text-[#F59E0B]"
                              : role.name === "MODERATOR"
                              ? "text-[#3B82F6]"
                              : "text-[#10B981]"
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-white text-base">{role.name}</CardTitle>
                          {role.isSystem && (
                            <Badge className="bg-[#6366F1]/10 text-[#6366F1] text-xs mt-1">Hệ thống</Badge>
                          )}
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
                    <CardDescription className="text-[#64748B] text-sm mt-2">
                      {role.description || "Không có mô tả"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-[#64748B]" />
                      <span className="text-sm text-[#94A3B8]">{role.userCount} người dùng</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map(permission => (
                        <Badge key={permission} className="bg-[#1E293B] text-[#94A3B8] text-xs font-mono">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge className="bg-[#1E293B] text-[#64748B] text-xs">
                          +{role.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
