"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  CreditCard,
  Sparkles,
  Settings,
  Home,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getMockSession } from "@/lib/mock-auth";
import { useState, useEffect } from "react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/nguoi-dung", label: "Người dùng", icon: Users },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: Receipt },
  { href: "/admin/nap-tien", label: "Nạp tiền", icon: CreditCard },
  { href: "/admin/dich-vu", label: "Dịch vụ", icon: Sparkles },
  { href: "/admin/cai-dat", label: "Cài đặt", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: { name: string; role: string; id: string } } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("shopaccount_session");
    if (stored) {
      try {
        setSession({ user: JSON.parse(stored) });
      } catch {}
    }
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#1E293B] bg-[#0F172A] transition-transform duration-300 lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[#1E293B] px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-sora text-lg font-bold text-white">Admin</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm text-[#94A3B8] transition-all hover:bg-[#1F2937] hover:text-white"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Link>

          <div className="pt-2 pb-1">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              Quản lý
            </p>
          </div>

          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                    : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {session && (
          <div className="border-t border-[#1E293B] p-3">
            <div className="flex items-center gap-3 rounded-[12px] bg-[#111827] p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                <span className="text-sm font-bold text-white">
                  {session.user.name?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-[#64748B]">{session.user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
