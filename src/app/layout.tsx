import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ScrollRevealProvider } from "@/components/providers/scroll-reveal-provider";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
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

export async function generateMetadata(): Promise<Metadata> {
  // Settings đã được cache ở client qua usePublicSettings
  // Layout chỉ trả về default metadata, client sẽ update sau khi load
  return {
    title: "ShopAccount - Hệ thống bán tài khoản & dịch vụ online",
    description: "Mua tài khoản nhanh chóng - thanh toán tự động - hỗ trợ 24/7",
    keywords: ["mua tai khoan", "ban tai khoan online", "netflix", "spotify", "canva pro"],
  };
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
            <ScrollRevealProvider>
              <Header />
              <main className="flex-1 relative z-10">{children}</main>
              <Footer />
              <CartDrawer />
            </ScrollRevealProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
