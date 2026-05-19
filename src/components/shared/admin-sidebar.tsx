"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Headphones,
  ShieldCheck,
  LayoutGrid,
  Banknote,
  Settings,
  LogOut,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useAdminOrderCount } from "@/hooks/useAdmin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isLogout?: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: countData } = useAdminOrderCount();

  const pendingServiceCount = countData?.serviceCount ?? 0;
  const pendingWarrantyCount = countData?.warrantyCount ?? 0;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const adminSections: { title: string; items: NavItem[] }[] = [
    {
      title: "QUẢN TRỊ",
      items: [
        { href: "/shop-account-adm-notuser", label: "Tổng quan", icon: LayoutDashboard },
        { href: "/shop-account-adm-notuser/danh-muc", label: "Danh mục", icon: LayoutGrid },
        { href: "/shop-account-adm-notuser/nguoi-dung", label: "Người dùng", icon: Users },
        { href: "/shop-account-adm-notuser/san-pham", label: "Sản phẩm", icon: Package },
        { href: "/shop-account-adm-notuser/don-hang", label: "Đơn hàng", icon: ShoppingBag, badge: pendingServiceCount > 0 ? pendingServiceCount : undefined },
        { href: "/shop-account-adm-notuser/bao-hanh", label: "Bảo hành", icon: ShieldCheck, badge: pendingWarrantyCount > 0 ? pendingWarrantyCount : undefined },
        { href: "/shop-account-adm-notuser/dich-vu", label: "Dịch vụ", icon: Headphones },
        { href: "/shop-account-adm-notuser/nap-tien", label: "Nạp tiền", icon: Banknote },
        { href: "/shop-account-adm-notuser/cai-dat", label: "Cài đặt Web", icon: Settings },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { href: "/", label: "Dashboard User", icon: Sun },
        { href: "/logout", label: "Đăng xuất", icon: LogOut, isLogout: true },
      ],
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col bg-[#0F172A] border-r border-[#1E293B]">
      {/* Logo & Brand */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
            <span className="text-xs font-bold text-white">NM</span>
          </div>
          <div>
            <span className="text-sm font-bold text-white">SHOPACCOUNT</span>
            <span className="block text-[10px] text-[#6366F1] -mt-0.5">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* User Profile */}
      {session?.user && (
        <div className="px-4 py-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
              <span className="text-sm font-bold text-white">
                {session.user.name?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">{session.user.name}</p>
              <p className="text-xs text-[#6366F1]">Quản trị viên</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {adminSections.map((section) => (
          <div key={section.title}>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                if (item.isLogout) {
                  return (
                    <button
                      key={item.href}
                      onClick={handleSignOut}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-all",
                        "text-[#EF4444] hover:bg-[#EF4444]/10"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-all",
                      isActive
                        ? "bg-[#6366F1]/15 text-[#6366F1]"
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Brand */}
      <div className="border-t border-[#1E293B] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
            <ShoppingBag className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs text-[#475569]">
            Shop<span className="text-[#6366F1]">Account</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
