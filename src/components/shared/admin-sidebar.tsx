"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Shield,
  ClipboardList,
  Crown,
  UserCog,
  UserCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useAdminOrderCount } from "@/hooks/useAdmin";

const ROLE_LEVELS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MODERATOR: 3,
  STAFF: 4,
  USER: 5,
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isLogout?: boolean;
  minRole?: number;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: countData } = useAdminOrderCount();

  const userRole = session?.user?.role || "USER";
  const userLevel = ROLE_LEVELS[userRole] || 5;
  const pendingServiceCount = countData?.serviceCount ?? 0;
  const pendingWarrantyCount = countData?.warrantyCount ?? 0;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const canAccess = (minRole?: number) => {
    if (!minRole) return true;
    return userLevel <= minRole;
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case "SUPER_ADMIN":
        return Crown;
      case "ADMIN":
        return Shield;
      case "MODERATOR":
        return UserCog;
      case "STAFF":
        return UserCheck;
      default:
        return User;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "SUPER_ADMIN":
        return "Chủ Shop";
      case "ADMIN":
        return "Quản trị viên";
      case "MODERATOR":
        return "Điều hành viên";
      case "STAFF":
        return "Nhân viên";
      default:
        return "Người dùng";
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case "SUPER_ADMIN":
        return "text-[#EF4444]";
      case "ADMIN":
        return "text-[#F59E0B]";
      case "MODERATOR":
        return "text-[#3B82F6]";
      case "STAFF":
        return "text-[#10B981]";
      default:
        return "text-[#64748B]";
    }
  };

  const RoleIcon = getRoleIcon();

  const adminSections: { title: string; items: NavItem[] }[] = [
    {
      title: "QUẢN TRỊ",
      items: [
        { href: "/adm", label: "Dashboard", icon: LayoutDashboard, minRole: 4 },
        { href: "/adm/danh-muc", label: "Danh mục", icon: LayoutGrid, minRole: 2 },
        { href: "/adm/nguoi-dung", label: "Người dùng", icon: Users, minRole: 2 },
        { href: "/adm/san-pham", label: "Sản phẩm", icon: Package, minRole: 2 },
        { href: "/adm/don-hang", label: "Đơn hàng", icon: ShoppingBag, minRole: 3, badge: pendingServiceCount > 0 ? pendingServiceCount : undefined },
        { href: "/adm/bao-hanh", label: "Bảo hành", icon: ShieldCheck, minRole: 3, badge: pendingWarrantyCount > 0 ? pendingWarrantyCount : undefined },
        { href: "/adm/dich-vu", label: "Dịch vụ", icon: Headphones, minRole: 2 },
        { href: "/adm/nap-tien", label: "Nạp tiền", icon: Banknote, minRole: 2 },
        { href: "/adm/cai-dat", label: "Cài đặt Web", icon: Settings, minRole: 2 },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        { href: "/adm/roles", label: "Vai trò & Quyền", icon: Shield, minRole: 1 },
        { href: "/adm/nhat-ky", label: "Nhật ký hoạt động", icon: ClipboardList, minRole: 2 },
      ],
    },
    {
      title: "TÀI KHOẢN",
      items: [
        { href: "/", label: "Trang chủ", icon: Sun },
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
              <p className={`text-xs ${getRoleColor()} flex items-center gap-1`}>
                <RoleIcon className="h-3 w-3" />
                {getRoleLabel()}
              </p>
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
                if (!canAccess(item.minRole)) return null;

                const isActive = pathname === item.href || (item.href !== "/adm" && item.href !== "/" && pathname.startsWith(item.href));

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
