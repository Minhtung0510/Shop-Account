"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockProducts, mockCategories, mockServices } from "@/lib/mock-data";
import { useMockSession } from "@/lib/mock-auth";
import {
  Zap,
  Shield,
  Clock,
  Headphones,
  ChevronRight,
  Star,
  CheckCircle,
  Play,
  Users,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Tự động 100%",
    description: "Nhận tài khoản ngay sau khi thanh toán",
  },
  {
    icon: Shield,
    title: "Bảo hành",
    description: "Hỗ trợ bảo hành khi có lỗi từ nhà cung cấp",
  },
  {
    icon: Clock,
    title: "Hoạt động 24/7",
    description: "Mua bất kỳ lúc nào với hệ thống tự động",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ luôn sẵn sàng giải đáp",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useMockSession();

  const handleProductClick = (e: React.MouseEvent, slug: string) => {
    if (!session) {
      e.preventDefault();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <Zap className="h-4 w-4" />
                Hệ thống tự động 24/7
              </div>

              <h1 className="font-sora text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-text-primary">
                Hệ Thống Bán{" "}
                <span className="gradient-text">Tài Khoản</span> &{" "}
                <span className="gradient-text">Dịch Vụ</span> Online Tự Động
              </h1>

              <p className="text-lg text-text-secondary max-w-lg">
                Mua tài khoản nhanh chóng – thanh toán tự động – hỗ trợ 24/7.
                Đăng ký, nạp tiền, mua hàng trong vài giây.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/tai-khoan">
                  <Button size="xl">
                    <Play className="h-5 w-5" />
                    Mua ngay
                  </Button>
                </Link>
                <Link href="/nap-tien">
                  <Button variant="outline" size="xl">
                    <CreditCard className="h-5 w-5" />
                    Nạp tiền
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <p className="font-sora text-2xl font-bold text-text-primary">50K+</p>
                  <p className="text-sm text-text-muted">Khách hàng</p>
                </div>
                <div>
                  <p className="font-sora text-2xl font-bold text-text-primary">99.9%</p>
                  <p className="text-sm text-text-muted">Uptime</p>
                </div>
                <div>
                  <p className="font-sora text-2xl font-bold text-text-primary">4.9/5</p>
                  <p className="text-sm text-text-muted">Đánh giá</p>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Mockup */}
            <div className="relative animate-fade-up hidden lg:block" style={{ animationDelay: "200ms" }}>
              <div className="relative rounded-[24px] border border-border bg-bg-card/80 p-6 shadow-card">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  {/* Balance Card */}
                  <div className="rounded-[18px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] p-5">
                    <p className="text-sm text-white/80">Số dư tài khoản</p>
                    <p className="font-sora text-3xl font-bold text-white">2,500,000đ</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="white">VIP</Badge>
                      <Badge variant="white">UID_ABC123</Badge>
                    </div>
                  </div>

                  {/* Order Card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[14px] border border-border bg-bg-primary p-4">
                      <p className="text-xs text-text-muted">Đơn hàng</p>
                      <p className="font-sora text-xl font-bold text-text-primary">24</p>
                    </div>
                    <div className="rounded-[14px] border border-border bg-bg-primary p-4">
                      <p className="text-xs text-text-muted">Đã mua</p>
                      <p className="font-sora text-xl font-bold text-text-primary">12</p>
                    </div>
                  </div>

                  {/* Recent Purchase */}
                  <div className="rounded-[14px] border border-border bg-bg-primary p-4 space-y-3">
                    <p className="text-xs font-medium text-text-muted uppercase">MUA GẦN ĐÂY</p>
                    {[
                      { name: "Netflix Premium", price: "49,000đ", time: "2 phút trước" },
                      { name: "Spotify Family", price: "89,000đ", time: "5 phút trước" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm text-text-primary">{item.name}</span>
                        </div>
                        <span className="text-xs text-text-muted">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-text-primary">
                Sản phẩm hot 🔥
              </h2>
              <p className="text-text-secondary mt-1">Những tài khoản được mua nhiều nhất</p>
            </div>
            <Link href="/tai-khoan?sort=best_selling">
              <Button size="sm" className="hidden sm:flex items-center gap-2">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {mockProducts.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/tai-khoan/${product.slug}`} onClick={(e) => handleProductClick(e, product.slug ?? "")}>
                <Card hover glow className="group cursor-pointer overflow-hidden">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden rounded-t-[18px] bg-bg-primary">
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    {product.badge && (
                      <Badge
                        variant={
                          product.badge === "BEST_SELLER"
                            ? "orange"
                            : product.badge === "HOT"
                            ? "error"
                            : "purple"
                        }
                        className="absolute left-3 top-3"
                      >
                        {product.badge === "BEST_SELLER"
                          ? "🔥 Best"
                          : product.badge === "HOT"
                          ? "🔥 Hot"
                          : "⭐ Premium"}
                      </Badge>
                    )}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1">
                      <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-xs font-medium text-white">{product.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-sora font-semibold text-text-primary mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-text-muted mb-3">{product.category?.name}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sora text-lg font-bold text-primary">
                          {formatCurrency(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-xs text-text-muted line-through">
                            {formatCurrency(product.originalPrice)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Còn lại</p>
                        <p className="text-sm font-medium text-success">{product.stock}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Facebook Services */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-text-primary">
                Dịch vụ Facebook
              </h2>
              <p className="text-text-secondary mt-1">Các dịch vụ hỗ trợ tài khoản Facebook</p>
            </div>
            <Link href="/dich-vu-facebook" className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {mockServices.map((service) => (
              <Card key={service.id} hover className="group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary/10">
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-sora font-semibold text-text-primary mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-sora font-bold text-primary">
                          Từ {formatCurrency(service.price)}
                        </p>
                        <Button size="sm" variant="outline" className="group-hover:border-primary group-hover:text-primary">
                          Đặt dịch vụ
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-0 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-1 lg:px-2">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-primary to-secondary p-12 lg:p-16">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative text-center">
              <h2 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Đăng ký ngay hôm nay và nhận ưu đãi nạp tiền lần đầu lên đến 20%.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/register">
                  <Button
                    size="xl"
                    className="bg-white text-primary hover:bg-white/90 shadow-lg"
                  >
                    <Users className="h-5 w-5" />
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/nap-tien">
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Nạp tiền ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature) => (
              <Card key={feature.title} hover className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-sora font-semibold text-text-primary mb-1">{feature.title}</h3>
                  <p className="text-xs text-text-secondary">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
