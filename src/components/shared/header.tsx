"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingCart,
  History,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore, useUIStore, useUserStore, useSettingsStore } from "@/store";
import { usePublicSettings } from "@/hooks/usePublicSettings";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  hasDropdown?: boolean;
};

const socialDropdownItems = [
  { label: "Dịch vụ Facebook", href: "/dich-vu-facebook", icon: "📘" },
  { label: "Dịch vụ Instagram", href: "/dich-vu-instagram", icon: "📸" },
  { label: "Dịch vụ TikTok", href: "/dich-vu-tiktok", icon: "🎵" },
];

const publicNavItems: NavItem[] = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/dich-vu-facebook", label: "Dịch vụ MXH", icon: Sparkles, hasDropdown: true },
  { href: "/dich-vu-tuong-tac", label: "Dịch vụ Tương tác", icon: Sparkles },
  { href: "/nap-tien", label: "Nạp tiền", icon: Wallet },
  { href: "/lich-su", label: "Lịch sử", icon: History },
  { href: "/lien-he", label: "Liên hệ", icon: Shield },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSocialMenuOpen, setIsSocialMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userFromStore = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCart = useUIStore((s) => s.openCart);
  const settings = useSettingsStore((s) => s.settings);
  usePublicSettings();

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [pathname]);

  const navItems = publicNavItems;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleInteractionService = () => {
    window.location.href = "/dich-vu-tuong-tac";
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1E293B] glass">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-sora text-xl font-bold text-white">
                  {settings.store_name || "ShopAccount"}
                </span>
                {settings.store_hotline && (
                  <a
                    href={`tel:${settings.store_hotline.replace(/\s/g, "")}`}
                    className="hidden xl:flex items-center gap-1.5 rounded-[8px] border border-[#1E293B] bg-[#111827] px-2.5 py-1 text-xs text-[#94A3B8] hover:border-[#3B82F6] hover:text-white transition-all"
                  >
                    <span>📞</span>
                    <span className="font-medium">{settings.store_hotline}</span>
                  </a>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.hasDropdown && item.href === "/dich-vu-facebook") {
                  return (
                    <div key={item.href} className="relative">
                      <button
                        onClick={() => setIsSocialMenuOpen(!isSocialMenuOpen)}
                        className={cn(
                          "flex items-center gap-1 px-4 py-2 rounded-[12px] text-sm font-medium transition-all duration-200",
                          pathname.startsWith("/dich-vu")
                            ? "bg-[#1F2937] text-white"
                            : "text-[#94A3B8] hover:text-white hover:bg-[#1F2937]"
                        )}
                      >
                        {item.label}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", isSocialMenuOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isSocialMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="absolute left-0 top-full mt-2 w-56 rounded-[16px] border border-[#1E293B] bg-[#111827] shadow-xl overflow-hidden z-50"
                          >
                            {socialDropdownItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsSocialMenuOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                  pathname === subItem.href
                                    ? "bg-[#1F2937] text-white"
                                    : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
                                )}
                              >
                                <span className="text-lg">{subItem.icon}</span>
                                {subItem.label}
                                <ArrowRight className="h-3 w-3 ml-auto" />
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-[12px] text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-[#1F2937] text-white"
                        : "text-[#94A3B8] hover:text-white hover:bg-[#1F2937]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#1E293B] bg-[#111827] transition-all duration-200 hover:border-[#3B82F6] hover:bg-[#1F2937]"
              >
                <ShoppingCart className="h-5 w-5 text-[#94A3B8]" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Auth Section */}
              {mounted && userFromStore ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-[12px] border border-[#1E293B] bg-[#111827] px-3 py-2 transition-all duration-200 hover:border-[#3B82F6]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                      <span className="text-xs font-bold text-white">
                        {userFromStore.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-medium text-white">{userFromStore.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">
                        {formatCurrency(userFromStore.balance || 0)}
                      </p>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-[#64748B] transition-transform",
                      isUserMenuOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-[16px] border border-[#1E293B] bg-[#111827] shadow-xl"
                      >
                        <div className="border-b border-[#1E293B] p-3">
                          <p className="font-medium text-white">{userFromStore.name}</p>
                          <p className="text-xs text-[#94A3B8]">{userFromStore.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/cai-dat"
                            className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#94A3B8] transition-colors hover:bg-[#1F2937] hover:text-white"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            Cài đặt tài khoản
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              handleSignOut();
                            }}
                            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-sm text-[#EF4444] transition-colors hover:bg-[#1F2937]"
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Đăng nhập</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Đăng ký</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex lg:hidden h-10 w-10 items-center justify-center rounded-[12px] border border-[#1E293B] bg-[#111827]"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-[#1E293B] overflow-hidden"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  if (item.hasDropdown && item.href === "/dich-vu-facebook") {
                    return (
                      <div key={item.href}>
                        <button
                          onClick={() => setIsSocialMenuOpen(!isSocialMenuOpen)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-all",
                            pathname.startsWith("/dich-vu")
                              ? "bg-[#1F2937] text-white"
                              : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </div>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isSocialMenuOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {isSocialMenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-6 mt-1 space-y-1 overflow-hidden"
                            >
                              {socialDropdownItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => { setIsMenuOpen(false); setIsSocialMenuOpen(false); }}
                                  className={cn(
                                    "flex items-center gap-3 rounded-[12px] px-4 py-2 text-sm transition-colors",
                                    pathname === subItem.href
                                      ? "bg-[#1F2937] text-white"
                                      : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
                                  )}
                                >
                                  <span className="text-lg">{subItem.icon}</span>
                                  {subItem.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-all",
                        pathname === item.href
                          ? "bg-[#1F2937] text-white"
                          : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                {mounted && !userFromStore && (
                  <div className="flex gap-2 pt-2">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="sm" className="w-full">
                        Đăng ký
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
