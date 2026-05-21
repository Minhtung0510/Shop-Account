import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
import { db } from "@/lib/db";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.setting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return {
      title: map.store_name ? `${map.store_name} - Hệ thống bán tài khoản & dịch vụ` : "ShopAccount",
      description: map.description || "Mua tài khoản nhanh chóng - thanh toán tự động - hỗ trợ 24/7",
      keywords: map.keywords ? map.keywords.split(",").map((k) => k.trim()) : ["mua tai khoan", "ban tai khoan online"],
    };
  } catch {
    return {
      title: "ShopAccount - Hệ thống bán tài khoản & dịch vụ online",
      description: "Mua tài khoản nhanh chóng - thanh toán tự động - hỗ trợ 24/7",
      keywords: ["mua tai khoan", "ban tai khoan online", "netflix", "spotify", "canva pro"],
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${sora.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>
          <ToastProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
