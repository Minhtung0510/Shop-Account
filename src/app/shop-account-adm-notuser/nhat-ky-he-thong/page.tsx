"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/utils";
import {
  Search,
  Filter,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserPlus,
  UserMinus,
  Edit,
  Trash,
  Eye,
  LogIn,
  LogOut,
  Settings,
  Package,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";

type AuditAction = string;

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string; icon: React.ElementType }> = {
  CREATE: { label: "Tạo mới", color: "bg-[#10B981]/10 text-[#10B981]", icon: UserPlus },
  READ: { label: "Xem", color: "bg-[#6366F1]/10 text-[#6366F1]", icon: Eye },
  UPDATE: { label: "Cập nhật", color: "bg-[#F59E0B]/10 text-[#F59E0B]", icon: Edit },
  DELETE: { label: "Xóa", color: "bg-[#EF4444]/10 text-[#EF4444]", icon: Trash },
  LOGIN: { label: "Đăng nhập", color: "bg-[#3B82F6]/10 text-[#3B82F6]", icon: LogIn },
  LOGOUT: { label: "Đăng xuất", color: "bg-[#64748B]/10 text-[#64748B]", icon: LogOut },
  PASSWORD_CHANGE: { label: "Đổi mật khẩu", color: "bg-[#EC4899]/10 text-[#EC4899]", icon: Shield },
  PERMISSION_CHANGE: { label: "Đổi quyền", color: "bg-[#8B5CF6]/10 text-[#8B5CF6]", icon: Shield },
  ROLE_CHANGE: { label: "Đổi vai trò", color: "bg-[#14B8A6]/10 text-[#14B8A6]", icon: UserMinus },
  APPROVE: { label: "Phê duyệt", color: "bg-[#22C55E]/10 text-[#22C55E]", icon: Shield },
  REJECT: { label: "Từ chối", color: "bg-[#F97316]/10 text-[#F97316]", icon: AlertCircle },
  REFUND: { label: "Hoàn tiền", color: "bg-[#06B6D4]/10 text-[#06B6D4]", icon: ShoppingCart },
};

interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entityType", entityFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();

      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.user?.username?.toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.entityId?.toLowerCase().includes(searchLower) ||
      log.entityType.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteOldLogs = async () => {
    if (!confirm("Bạn có chắc muốn xóa các log cũ hơn 90 ngày?")) return;

    try {
      const res = await fetch("/api/admin/audit-logs?days=90", { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        alert(`Đã xóa ${data.deleted} log cũ`);
        fetchLogs();
      }
    } catch (error) {
      console.error("Failed to delete old logs:", error);
    }
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action] || { label: action, color: "bg-[#64748B]/10 text-[#64748B]", icon: Eye };
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <AdminSidebar />

      <div className="ml-[240px]">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E293B] bg-[#020617] px-6 h-16">
          <div>
            <h1 className="text-lg font-bold text-white">Nhật ký hoạt động</h1>
            <p className="text-xs text-[#64748B]">Theo dõi tất cả hoạt động trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteOldLogs}
              className="border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa log cũ
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: "Tổng log", value: total.toLocaleString(), color: "text-white" },
              { label: "Hôm nay", value: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length.toString(), color: "text-[#3B82F6]" },
              { label: "Tuần này", value: logs.filter(l => new Date(l.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length.toString(), color: "text-[#10B981]" },
              { label: "Trang", value: `${page}/${totalPages}`, color: "text-[#64748B]" },
            ].map((stat) => (
              <Card key={stat.label} className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
                <CardContent className="p-4">
                  <p className="text-xs text-[#64748B] mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                    <Input
                      placeholder="Tìm kiếm người dùng, email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-[#1E293B] border-[#334155] text-white placeholder:text-[#64748B]"
                    />
                  </div>
                </div>

                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm"
                >
                  <option value="">Tất cả hành động</option>
                  {Object.entries(ACTION_CONFIG).map(([action, config]) => (
                    <option key={action} value={action}>{config.label}</option>
                  ))}
                </select>

                <select
                  value={entityFilter}
                  onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm"
                >
                  <option value="">Tất cả đối tượng</option>
                  <option value="users">Người dùng</option>
                  <option value="products">Sản phẩm</option>
                  <option value="orders">Đơn hàng</option>
                  <option value="roles">Vai trò</option>
                  <option value="settings">Cài đặt</option>
                  <option value="audit_logs">Audit Logs</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card className="!rounded-[12px] bg-[#0F172A] border-[#1E293B]">
            <CardHeader className="border-b border-[#1E293B]">
              <CardTitle className="text-white text-sm">Danh sách nhật ký</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Thời gian</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Người dùng</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Hành động</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">Đối tượng</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B]">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[#64748B]">
                          Đang tải...
                        </td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-[#64748B]">
                          Không có nhật ký nào
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const actionConfig = getActionConfig(log.action);
                        const ActionIcon = actionConfig.icon;

                        return (
                          <tr key={log.id} className="border-b border-[#1E293B] hover:bg-[#1E293B]/50">
                            <td className="px-4 py-3 text-sm text-[#94A3B8]">
                              {formatDistanceToNow(new Date(log.createdAt))}
                              <div className="text-xs text-[#64748B]">
                                {new Date(log.createdAt).toLocaleString("vi-VN")}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {log.user ? (
                                <div>
                                  <p className="text-sm text-white">{log.user.username}</p>
                                  <p className="text-xs text-[#64748B]">{log.user.email}</p>
                                </div>
                              ) : (
                                <span className="text-sm text-[#64748B]">Hệ thống</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={actionConfig.color}>
                                <ActionIcon className="h-3 w-3 mr-1" />
                                {actionConfig.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-[#94A3B8] capitalize">
                              {log.entityType}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#64748B] font-mono">
                              {log.entityId ? (
                                <span className="truncate max-w-[100px] block">{log.entityId}</span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">
                              {log.ipAddress || "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E293B]">
                  <p className="text-sm text-[#64748B]">
                    Trang {page} / {totalPages} - Tổng {total} log
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-[#334155]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-white px-2">{page}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="border-[#334155]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
