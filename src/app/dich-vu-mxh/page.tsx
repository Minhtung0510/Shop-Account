"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useServices } from "@/hooks/useData";
import { useSession } from "@/hooks/useSession";
import { useUserStore } from "@/store";
import { OrderFormModal } from "@/components/order-form-modal";
import {
  Globe,
  ArrowRight,
  Clock,
  Shield,
  Star,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  price: number;
  description: string;
  category: string;
};

export default function SocialServicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: allServices = [] } = useServices();
  const userFromStore = useUserStore((s) => s.user);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fbServices = allServices.filter((s) => s.category === "Facebook");
  const igServices = allServices.filter((s) => s.category === "Instagram");
  const ttServices = allServices.filter((s) => s.category === "TikTok");

  const handleServiceClick = (service: Service) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!userFromStore || userFromStore.balance < service.price) {
      router.push("/nap-tien");
      return;
    }
    setSelectedService(service);
  };

  const renderServiceCard = (service: Service, colorClass: string) => (
    <Card key={service.id} hover className="group cursor-pointer">
      <CardContent className="p-5">
        <div className="flex gap-4 mb-4">
          <div className={colorClass}>
            <span className="text-2xl">{service.icon}</span>
          </div>
          <div>
            <h3 className="font-sora font-semibold text-white mb-1">
              {service.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              {service.category}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-[#94A3B8] mb-4 line-clamp-2">
          {service.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sora text-lg font-bold text-[#3B82F6]">
              Từ {formatCurrency(service.price)}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="group-hover:gap-2"
            onClick={() => handleServiceClick(service)}
          >
            Đặt dịch vụ
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-1.5 text-sm text-[#3B82F6] mb-4">
            <Globe className="h-4 w-4" />
            Dịch vụ MXH
          </div>
          <h1 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-2">
            Dịch vụ Mạng Xã Hội
          </h1>
          <p className="text-[#94A3B8]">
            Các dịch vụ hỗ trợ Facebook, Instagram, TikTok chuyên nghiệp
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Clock, text: "Xử lý nhanh 1-24h" },
            { icon: Shield, text: "Cam kết hoàn tiền" },
            { icon: Star, text: "Đánh giá 4.9/5" },
          ].map((item, i) => (
            <div key={i} className="rounded-[14px] border border-[#1E293B] bg-[#111827] p-4 text-center">
              <item.icon className="h-6 w-6 text-[#3B82F6] mx-auto mb-2" />
              <p className="text-sm text-white font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#1877F2] to-[#0D8BD9]">
                <span className="text-xl">📘</span>
              </div>
              <h2 className="font-sora text-xl font-bold text-white">
                Dịch vụ Facebook
              </h2>
            </div>
            <Link href="/dich-vu-mxh" className="text-sm text-[#3B82F6] hover:underline">
              Xem tất cả <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(fbServices || []).map((service) =>
              renderServiceCard(service, "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1877F2] to-[#0D8BD9]")
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#E4405F] to-[#F77737]">
                <span className="text-xl">📸</span>
              </div>
              <h2 className="font-sora text-xl font-bold text-white">
                Dịch vụ Instagram
              </h2>
            </div>
            <Link href="/dich-vu-instagram" className="text-sm text-[#E4405F] hover:underline">
              Xem tất cả <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(igServices || []).map((service) =>
              renderServiceCard(service, "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E4405F] to-[#F77737]")
            )}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#000000] to-[#25F4EE]">
                <span className="text-xl">🎵</span>
              </div>
              <h2 className="font-sora text-xl font-bold text-white">
                Dịch vụ TikTok
              </h2>
            </div>
            <Link href="/dich-vu-tiktok" className="text-sm text-[#25F4EE] hover:underline">
              Xem tất cả <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(ttServices || []).map((service) =>
              renderServiceCard(service, "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#000000] to-[#25F4EE]")
            )}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#1E293B] bg-[#111827] p-8 text-center">
          <h3 className="font-sora text-xl font-bold text-white mb-2">
            Cần dịch vụ tùy chỉnh?
          </h3>
          <p className="text-[#94A3B8] mb-6">
            Liên hệ với chúng tôi để được tư vấn dịch vụ theo nhu cầu riêng
          </p>
          <Link href="/lien-he">
            <Button>
              <Globe className="h-4 w-4" />
              Liên hệ hỗ trợ
            </Button>
          </Link>
        </div>
      </div>

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
