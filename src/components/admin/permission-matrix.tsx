"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types";

interface PermissionMatrixProps {
  permissions: Permission[];
  onChange: (permissions: Permission[]) => void;
  disabled?: boolean;
}

interface PermissionRow {
  key: string;
  label: string;
  permissions: {
    key: Permission;
    label: string;
  }[];
}

const PERMISSION_ROWS: PermissionRow[] = [
  {
    key: "products",
    label: "Sản phẩm",
    permissions: [
      { key: "products:read", label: "Xem" },
      { key: "products:create", label: "Tạo" },
      { key: "products:update", label: "Sửa" },
      { key: "products:delete", label: "Xóa" },
    ],
  },
  {
    key: "categories",
    label: "Danh mục",
    permissions: [
      { key: "categories:read", label: "Xem" },
      { key: "categories:create", label: "Tạo" },
      { key: "categories:update", label: "Sửa" },
      { key: "categories:delete", label: "Xóa" },
    ],
  },
  {
    key: "orders",
    label: "Đơn hàng",
    permissions: [
      { key: "orders:read", label: "Xem" },
      { key: "orders:update", label: "Duyệt" },
      { key: "orders:delete", label: "Xóa" },
      { key: "orders:refund", label: "Hoàn tiền" },
    ],
  },
  {
    key: "users",
    label: "Người dùng",
    permissions: [
      { key: "users:read", label: "Xem" },
      { key: "users:create", label: "Tạo" },
      { key: "users:update", label: "Sửa" },
      { key: "users:delete", label: "Xóa" },
    ],
  },
  {
    key: "finance",
    label: "Tài chính",
    permissions: [
      { key: "transactions:read", label: "Xem" },
      { key: "transactions:create", label: "Nạp tiền" },
      { key: "reports:read", label: "Báo cáo" },
      { key: "reports:export", label: "Xuất" },
    ],
  },
  {
    key: "warranty",
    label: "Bảo hành",
    permissions: [
      { key: "warranty:read", label: "Xem" },
      { key: "warranty:update", label: "Xử lý" },
    ],
  },
  {
    key: "services",
    label: "Dịch vụ",
    permissions: [
      { key: "services:read", label: "Xem" },
      { key: "services:create", label: "Tạo" },
      { key: "services:update", label: "Sửa" },
      { key: "services:delete", label: "Xóa" },
    ],
  },
  {
    key: "roles",
    label: "Vai trò",
    permissions: [
      { key: "roles:read", label: "Xem" },
      { key: "roles:create", label: "Tạo" },
      { key: "roles:update", label: "Sửa" },
      { key: "roles:delete", label: "Xóa" },
    ],
  },
  {
    key: "settings",
    label: "Cài đặt",
    permissions: [
      { key: "settings:read", label: "Xem" },
      { key: "settings:update", label: "Sửa" },
    ],
  },
  {
    key: "audit",
    label: "Nhật ký",
    permissions: [
      { key: "audit_logs:read", label: "Xem" },
      { key: "audit_logs:delete", label: "Xóa" },
    ],
  },
];

export function PermissionMatrix({ permissions, onChange, disabled }: PermissionMatrixProps) {
  const isAllSelected = (row: PermissionRow) => {
    return row.permissions.every((p) => permissions.includes(p.key));
  };

  const isSomeSelected = (row: PermissionRow) => {
    return row.permissions.some((p) => permissions.includes(p.key));
  };

  const toggleRow = (row: PermissionRow, select: boolean) => {
    if (disabled) return;

    const newPermissions = select
      ? [...new Set([...permissions, ...row.permissions.map((p) => p.key)])]
      : permissions.filter((p) => !row.permissions.some((rp) => rp.key === p));

    onChange(newPermissions);
  };

  const togglePermission = (permission: Permission) => {
    if (disabled) return;

    const newPermissions = permissions.includes(permission)
      ? permissions.filter((p) => p !== permission)
      : [...permissions, permission];

    onChange(newPermissions);
  };

  return (
    <div className="border border-[#1E293B] rounded-[12px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1E293B]/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] w-[200px]">
                Module
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#64748B] min-w-[60px]">
                Xem
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#64748B] min-w-[60px]">
                Tạo
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#64748B] min-w-[60px]">
                Sửa
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[#64748B] min-w-[60px]">
                Xóa
              </th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((row) => {
              const allSelected = isAllSelected(row);
              const someSelected = isSomeSelected(row);
              const hasCol4 = row.permissions.length >= 4;
              const hasCol5 = row.permissions.length === 5;

              return (
                <tr key={row.key} className="border-t border-[#1E293B] hover:bg-[#1E293B]/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row, !allSelected)}
                        disabled={disabled}
                        className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                          allSelected
                            ? "bg-[#3B82F6] border-[#3B82F6]"
                            : someSelected
                            ? "bg-[#F59E0B]/20 border-[#F59E0B]"
                            : "border-[#334155] hover:border-[#3B82F6]"
                        )}
                      >
                        {allSelected ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : someSelected ? (
                          <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                        ) : null}
                      </button>
                      <span className="text-sm text-white font-medium">{row.label}</span>
                    </div>
                  </td>
                  {row.permissions.slice(0, 4).map((perm, idx) => {
                    const colSpan = row.permissions.length;
                    const canShow = idx < 4;
                    
                    if (!canShow) return null;

                    return (
                      <td key={perm.key} className="px-4 py-3 text-center">
                        {idx < row.permissions.length ? (
                          <button
                            type="button"
                            onClick={() => togglePermission(perm.key)}
                            disabled={disabled}
                            className={cn(
                              "h-7 w-7 rounded border flex items-center justify-center mx-auto transition-colors",
                              permissions.includes(perm.key)
                                ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981]"
                                : "border-[#334155] text-[#334155] hover:border-[#475569]"
                            )}
                          >
                            {permissions.includes(perm.key) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        ) : null}
                      </td>
                    );
                  })}
                  {row.permissions.length < 4 &&
                    Array.from({ length: 4 - row.permissions.length }).map((_, idx) => (
                      <td key={`empty-${idx}`} className="px-4 py-3 text-center">
                        <div className="h-7 w-7 rounded border border-[#1E293B] bg-[#1E293B]/30 mx-auto" />
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PermissionSummary({ permissions }: { permissions: Permission[] }) {
  const count = permissions.length;
  const total = PERMISSION_ROWS.reduce((sum, row) => sum + row.permissions.length, 0);

  return (
    <div className="text-sm text-[#64748B]">
      <span className="text-white font-medium">{count}</span> / {total} quyền
    </div>
  );
}
