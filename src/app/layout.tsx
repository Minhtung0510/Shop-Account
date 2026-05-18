import type { Metadata } from "next";
import { Providers } from "@/components/providers/providers";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { CartDrawer } from "@/components/shared/cart-drawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopAccount - Hệ thống bán tài khoản & dịch vụ online",
  description: "Mua tài khoản nhanh chóng - thanh toán tự động - hỗ trợ 24/7",
  keywords: ["mua tai khoan", "ban tai khoan online", "netflix", "spotify", "canva pro"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full">
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
