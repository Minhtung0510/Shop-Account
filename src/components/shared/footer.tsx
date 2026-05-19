import Link from "next/link";
import { ShoppingCart, Github, Mail, Shield } from "lucide-react";

const currentYear = new Date().getFullYear();

const footerLinks = [
  {
    title: "Dịch vụ",
    links: [
      { label: "Tài khoản", href: "/tai-khoan" },
      { label: "Dịch vụ Facebook", href: "/dich-vu-facebook" },
      { label: "Nạp tiền", href: "/nap-tien" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Trung tâm hỗ trợ", href: "/lien-he" },
      { label: "Chính sách bảo hành", href: "/chinh-sach" },
      { label: "Điều khoản sử dụng", href: "/dieu-khoan" },
    ],
  },
  {
    title: "Kết nối",
    links: [
      { label: "Facebook", href: "#" },
      { label: "Zalo", href: "#" },
      { label: "Telegram", href: "#" },
    ],
  },
];

interface Settings {
  store_name?: string;
  facebook_url?: string;
  zalo_url?: string;
  telegram_url?: string;
  [key: string]: string | undefined;
}

interface FooterProps {
  settings?: Settings;
}

export function Footer({ settings = {} }: FooterProps) {
  const storeName = settings.store_name || "ShopAccount";

  return (
    <footer className="border-t border-[#1E293B] bg-[#0F172A]">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="font-sora text-xl font-bold text-white">
                {storeName}
              </span>
            </Link>
            <p className="text-sm text-[#94A3B8]">
              Hệ thống bán tài khoản & dịch vụ online tự động. Mua nhanh - Thanh toán an toàn - Hỗ trợ 24/7.
            </p>
            <div className="flex items-center gap-3">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#1E293B] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {settings.zalo_url && (
                <a
                  href={settings.zalo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#1E293B] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="font-sora font-semibold text-white">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#94A3B8] transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E293B] pt-8">
          <p className="text-sm text-[#64748B]">
            © {currentYear} {storeName}. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Shield className="h-4 w-4 text-[#22C55E]" />
            Thanh toán an toàn & Bảo mật
          </div>
        </div>
      </div>
    </footer>
  );
}
