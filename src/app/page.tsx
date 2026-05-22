"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { useHomeProducts } from "@/hooks/useData";
import {
  Zap,
  Shield,
  Clock,
  Headphones,
  ChevronRight,
  Star,
  Play,
  Users,
  CreditCard,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { OrderFormModal } from "@/components/order-form-modal";
import { useUserStore } from "@/store";
import { FloatingParticles } from "@/components/floating-particles";
import { AnimatedCounter } from "@/components/animated-counter";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useRef } from "react";

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

// Memoized Product Card with Animation
const ProductCard = React.memo(function ProductCard({
  product,
  onProductClick,
  index = 0,
}: {
  product: any;
  onProductClick: (e: React.MouseEvent, slug: string) => void;
  index?: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "BEST_SELLER": return "orange";
      case "HOT": return "error";
      case "NEW": return "purple";
      case "PREMIUM": return "purple";
      default: return "default";
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case "BEST_SELLER": return "🔥 Best";
      case "HOT": return "🔥 Hot";
      case "NEW": return "✨ Mới";
      case "PREMIUM": return "⭐ VIP";
      default: return "";
    }
  };

  const isGif = (product.images?.[0] || product.thumbnail || "").toLowerCase().includes(".gif");
  const imageSrc = product.images?.[0] || product.thumbnail || "/placeholder.jpg";

  return (
    <Link href={`/tai-khoan/${product.slug || product.id}`} onClick={(e) => onProductClick(e, product.slug || product.id)}>
      <motion.div
        className="group cursor-pointer overflow-hidden h-full rounded-[18px] border border-[#1E293B] bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-shadow duration-300"
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

        <div className="relative aspect-square overflow-hidden rounded-t-[18px] bg-[#1F2937]">
          <motion.div
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
          >
            {isGif ? (
              <img src={imageSrc} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <Image src={imageSrc} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-4" loading="lazy" />
            )}
          </motion.div>

          {product.badge && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
              <Badge variant={getBadgeVariant(product.badge)} className="absolute left-3 top-3 z-10">{getBadgeLabel(product.badge)}</Badge>
            </motion.div>
          )}
          <motion.div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1" animate={{ scale: isHovered ? 1.1 : 1 }}>
            <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-xs font-medium text-white">{product.rating || "4.8"}</span>
          </motion.div>
        </div>
        <CardContent className="p-4 relative z-10">
          <motion.h3 className="font-sora font-semibold text-white mb-1 line-clamp-1" animate={{ color: isHovered ? "#60A5FA" : "#ffffff" }} transition={{ duration: 0.2 }}>
            {product.name}
          </motion.h3>
          <p className="text-xs text-[#64748B] mb-3">{product.category?.name}</p>
          <div className="flex items-center justify-between">
            <div>
              <motion.p className="font-sora text-lg font-bold text-[#3B82F6]" animate={{ scale: isHovered ? 1.05 : 1 }}>{formatCurrency(product.price)}</motion.p>
              {product.originalPrice && <p className="text-xs text-[#64748B] line-through">{formatCurrency(product.originalPrice)}</p>}
            </div>
            <motion.div className="text-right" animate={{ x: isHovered ? -4 : 0 }}>
              <p className="text-xs text-[#94A3B8]">Còn lại</p>
              <motion.p className="text-sm font-medium text-[#22C55E]" animate={{ color: isHovered ? "#4ADE80" : "#22C55E" }}>{product.stock}</motion.p>
            </motion.div>
          </div>
        </CardContent>
      </motion.div>
    </Link>
  );
});

// Memoized Service Card
const ServiceCard = React.memo(function ServiceCard({
  service,
  category,
  onOrder,
}: {
  service: any;
  category: string;
  onOrder: (service: any) => void;
}) {
  const gradientColors: Record<string, string> = {
    Facebook: "from-[#1877F2] to-[#0D8BD9]",
    Instagram: "from-[#E4405F] to-[#F77737]",
    TikTok: "from-[#000000] to-[#25F4EE]",
  };

  const accentColors: Record<string, string> = {
    Facebook: "[#1877F2]",
    Instagram: "[#E4405F]",
    TikTok: "[#25F4EE]",
  };

  return (
    <Card hover className="group cursor-pointer h-full">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${gradientColors[category] || "from-[#3B82F6] to-[#06B6D4]"}`}>
            <span className="text-2xl">{service.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-sora font-semibold text-white mb-1">
              {service.name}
            </h3>
            <p className="text-sm text-[#94A3B8] mb-3 line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between">
              <p className={`font-sora font-bold text-${accentColors[category] || "[#3B82F6]"}`}>
                Từ {formatCurrency(service.price)}
              </p>
              <Button size="sm" variant="outline" className={`group-hover:border-${accentColors[category] || "[#3B82F6]"}`} onClick={() => onOrder(service)}>
                Đặt dịch vụ
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: homeData, isLoading: homeLoading } = useHomeProducts();
  const [selectedService, setSelectedService] = useState<{
    id: string; name: string; slug: string; icon: string; price: number; description: string;
  } | null>(null);

  const userFromStore = useUserStore((s) => s.user);

  // Scroll parallax effect for hero
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Scroll reveal for sections
  const hotProductsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 0 });
  const featuresRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1, delay: 100 });
  const ctaRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2, delay: 50 });

  // Memoized handler to prevent ServiceCard re-renders
  const handleOrderService = React.useCallback((service: any) => {
    if (!session?.user) { router.push("/login"); return; }
    if (!userFromStore || userFromStore.balance < service.price) {
      router.push("/nap-tien");
      return;
    }
    setSelectedService(service);
  }, [session, userFromStore, router]);

  const handleProductClick = (e: React.MouseEvent, slug: string) => {
    if (!session) {
      e.preventDefault();
      router.push("/login");
    }
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "BEST_SELLER": return "orange";
      case "HOT": return "error";
      case "NEW": return "purple";
      case "PREMIUM": return "purple";
      default: return "default";
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case "BEST_SELLER": return "🔥 Best";
      case "HOT": return "🔥 Hot";
      case "NEW": return "✨ Mới";
      case "PREMIUM": return "⭐ VIP";
      default: return "";
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-16 lg:py-24">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[#3B82F6]/10 blur-3xl"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -200]) }}
          />
          <motion.div
            className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-[#06B6D4]/10 blur-3xl"
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 150]) }}
          />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div
              className="space-y-8"
              style={{ opacity: heroOpacity, y: heroY }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-1.5 text-sm text-[#3B82F6]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Zap className="h-4 w-4" />
                Hệ thống tự động 24/7
              </motion.div>

              <h1 className="font-sora text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                Hệ Thống Bán{" "}
                <motion.span
                  className="gradient-text"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                      "0 0 40px rgba(59, 130, 246, 0.8)",
                      "0 0 20px rgba(6, 182, 212, 0.5)",
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Tài Khoản
                </motion.span>{" "}
                &{" "}
                <motion.span
                  className="gradient-text"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.5)",
                      "0 0 40px rgba(6, 182, 212, 0.8)",
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                      "0 0 20px rgba(6, 182, 212, 0.5)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  Dịch Vụ
                </motion.span>{" "}
                Online Tự Động
              </h1>

              <motion.p
                className="text-lg text-[#94A3B8] max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Mua tài khoản nhanh chóng – thanh toán tự động – hỗ trợ 24/7.
                Đăng ký, nạp tiền, mua hàng trong vài giây.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/tai-khoan">
                  <Button size="xl" className="relative overflow-hidden group">
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Play className="h-5 w-5 mr-2" />
                    Mua ngay
                  </Button>
                </Link>
                <Link href="/nap-tien">
                  <Button variant="outline" size="xl" className="border-[#3B82F6]/50 hover:border-[#3B82F6] hover:bg-[#3B82F6]/10 transition-all duration-300">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Nạp tiền
                  </Button>
                </Link>
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                className="flex flex-wrap gap-8 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-sora text-2xl font-bold text-white">
                    <AnimatedCounter value={50000} suffix="+" prefix="" duration={2000} />
                  </p>
                  <p className="text-sm text-[#64748B]">Khách hàng</p>
                </motion.div>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-sora text-2xl font-bold text-white">
                    <AnimatedCounter value={99.9} suffix="%" prefix="" decimals={1} duration={2000} />
                  </p>
                  <p className="text-sm text-[#64748B]">Uptime</p>
                </motion.div>
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-sora text-2xl font-bold text-white">
                    <AnimatedCounter value={4.9} suffix="/5" prefix="" decimals={1} duration={2000} />
                  </p>
                  <p className="text-sm text-[#64748B]">Đánh giá</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right - Dashboard Mockup with Tilt */}
            <motion.div
              className="relative animate-fade-up hidden lg:block"
              style={{ opacity: heroOpacity, y: heroY }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative rounded-[24px] border border-[#1E293B] bg-[#111827]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-[0_25px_70px_rgba(0,0,0,0.5)] transition-shadow duration-300"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-[24px] opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#3B82F6]/5 to-[#06B6D4]/5 pointer-events-none" />

                {/* Mock Dashboard */}
                <div className="space-y-4 relative">
                  {/* Balance Card */}
                  <div className="relative rounded-[18px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] p-5 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                    <div className="relative">
                      <p className="text-sm text-white/80">Số dư tài khoản</p>
                      <p className="font-sora text-3xl font-bold text-white">2,500,000đ</p>
                      <div className="mt-3 flex gap-2">
                        <Badge variant="default" className="bg-white/20 text-white">VIP</Badge>
                        <Badge variant="default" className="bg-white/20 text-white">UID_ABC123</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Order Card */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[14px] border border-[#1E293B] bg-[#0F172A] p-4">
                      <p className="text-xs text-[#64748B]">Đơn hàng</p>
                      <p className="font-sora text-xl font-bold text-white">24</p>
                    </div>
                    <div className="rounded-[14px] border border-[#1E293B] bg-[#0F172A] p-4">
                      <p className="text-xs text-[#64748B]">Đã mua</p>
                      <p className="font-sora text-xl font-bold text-white">12</p>
                    </div>
                  </div>

                  {/* Recent Purchase */}
                  <div className="rounded-[14px] border border-[#1E293B] bg-[#0F172A] p-4 space-y-3">
                    <p className="text-xs font-medium text-[#64748B]">MUA GẦN ĐÂY</p>
                    {[
                      { name: "Netflix Premium", price: "49,000đ", time: "2 phút trước" },
                      { name: "Spotify Family", price: "89,000đ", time: "5 phút trước" },
                    ].map((item) => (
                      <motion.div
                        key={item.name}
                        className="flex items-center justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + Math.random() * 0.2 }}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                          <span className="text-sm text-white">{item.name}</span>
                        </div>
                        <span className="text-xs text-[#64748B]">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

    

      {/* Hot Products */}
      <section ref={hotProductsRef.ref} className="py-16 border-t border-[#1E293B]">
        <motion.div
          className="mx-auto max-w-[1200px] px-4 lg:px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={hotProductsRef.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={hotProductsRef.isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white">
                Sản phẩm hot 🔥
              </h2>
              <p className="text-[#94A3B8] mt-1">Những tài khoản được mua nhiều nhất</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={hotProductsRef.isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              <Link href="/tai-khoan?sort=best_selling" className="hidden sm:flex items-center gap-1 text-sm text-[#3B82F6] hover:underline group">
                Xem tất cả
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 stagger-children" data-scrollable>
            {(homeLoading ? [] : (homeData?.products || [])).slice(0, 10).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={hotProductsRef.isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} onProductClick={handleProductClick} index={index} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Social Media Services */}
      <section className="py-16 border-t border-[#1E293B]">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white">
                Dịch vụ Facebook
              </h2>
              <p className="text-[#94A3B8] mt-1">Các dịch vụ hỗ trợ tài khoản Facebook</p>
            </div>
            <Link href="/dich-vu-mxh" className="hidden sm:flex items-center gap-1 text-sm text-[#3B82F6] hover:underline">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {(homeData?.services?.filter((s: any) => s.category === "Facebook") || []).slice(0, 6).map((service: any) => (
              <ServiceCard key={service.id} service={service} category="Facebook" onOrder={handleOrderService} />
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Services */}
      <section className="py-16 border-t border-[#1E293B]">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white">
                Dịch vụ Instagram
              </h2>
              <p className="text-[#94A3B8] mt-1">Dịch vụ hỗ trợ tài khoản Instagram</p>
            </div>
            <Link href="/dich-vu-mxh" className="hidden sm:flex items-center gap-1 text-sm text-[#E4405F] hover:underline">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {(homeData?.services?.filter((s: any) => s.category === "Instagram") || []).slice(0, 6).map((service: any) => (
              <ServiceCard key={service.id} service={service} category="Instagram" onOrder={handleOrderService} />
            ))}
          </div>
        </div>
      </section>

      {/* TikTok Services */}
      <section className="py-16 border-t border-[#1E293B]">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white">
                Dịch vụ TikTok
              </h2>
              <p className="text-[#94A3B8] mt-1">Dịch vụ hỗ trợ tài khoản TikTok</p>
            </div>
            <Link href="/dich-vu-mxh" className="hidden sm:flex items-center gap-1 text-sm text-[#25F4EE] hover:underline">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {(homeData?.services?.filter((s: any) => s.category === "TikTok") || []).slice(0, 6).map((service: any) => (
              <ServiceCard key={service.id} service={service} category="TikTok" onOrder={handleOrderService} />
            ))}
          </div>
        </div>
      </section>
  {/* Categories */}
      {/* <section className="py-16 border-t border-[#1E293B]">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white">
                Danh mục nổi bật
              </h2>
              <p className="text-[#94A3B8] mt-1">Khám phá các loại tài khoản phổ biến</p>
            </div>
            <Link href="/tai-khoan" className="hidden sm:flex items-center gap-1 text-sm text-[#3B82F6] hover:underline">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(homeData?.categories || []).map((cat) => (
              <Link key={cat.name} href="#">
                <Card hover glow className="text-center group cursor-pointer">
                  <CardContent className="p-5">
                    <div
                      className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[14px] bg-gradient-to-br transition-transform group-hover:scale-110"
                      style={{ background: cat.color || "#3B82F6" }}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                    </div>
                    <h3 className="font-sora text-sm font-semibold text-white mb-0.5 line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      {cat.productCount} sản phẩm
                    </p>
                    <p className="text-xs font-medium text-[#3B82F6] mt-1">
                      Từ {formatCurrency(cat.fromPrice || 25000)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section> */}
      {/* CTA */}
      <section ref={ctaRef.ref} className="py-0 border-t border-[#1E293B]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={ctaRef.isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-[1200px] px-1 lg:px-2"
        >
          <motion.div
            className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] p-12 lg:p-16"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              style={{
                backgroundImage: "url(\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=\")",
                backgroundSize: "60px 60px",
              }}
            />

            <div className="relative text-center">
              <motion.h2
                className="font-sora text-3xl lg:text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaRef.isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                Sẵn sàng bắt đầu?
              </motion.h2>
              <motion.p
                className="text-white/80 mb-8 max-w-lg mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaRef.isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
              >
                Đăng ký ngay hôm nay và nhận ưu đãi nạp tiền lần đầu lên đến 20%.
              </motion.p>
              <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={ctaRef.isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                <Link href="/register">
                  <Button
                    size="xl"
                    className="bg-white text-[#3B82F6] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Đăng ký ngay
                  </Button>
                </Link>
                <Link href="/nap-tien">
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Nạp tiền ngay
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>
      
      {/* Features */}
      <section ref={featuresRef.ref} className="py-16 border-t border-[#1E293B]">
        <motion.div
          className="mx-auto max-w-[1200px] px-4 lg:px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={featuresRef.isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresRef.isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="text-center group cursor-pointer">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]/20 transition-colors duration-300">
                    <feature.icon className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-sora font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-[#94A3B8]">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {selectedService && userFromStore && (
        <OrderFormModal
          service={selectedService}
          user={userFromStore}
          onClose={() => setSelectedService(null)}
          onRequireLogin={() => router.push("/login")}
          onRequireNapTien={() => router.push("/nap-tien")}
        />
      )}

    </div>
  );
}
