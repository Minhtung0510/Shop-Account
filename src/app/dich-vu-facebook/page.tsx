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
  MessageSquare,
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

export default function FacebookServicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: services = [] } = useServices("Facebook");
  const userFromStore = useUserStore((s) => s.user);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-1.5 text-sm text-[#3B82F6] mb-4">
            <MessageSquare className="h-4 w-4" />
            Dịch vụ Facebook
          </div>
          <h1 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-2">
            Dịch vụ hỗ trợ Facebook
          </h1>
          <p className="text-[#94A3B8]">
            Các dịch vụ hỗ trợ tài khoản và Fanpage Facebook chuyên nghiệp
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(services || []).map((service) => (
            <Card key={service.id} hover className="group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1877F2] to-[#0D8BD9]">
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
                    <p className="font-sora text-xl font-bold text-[#3B82F6]">
                      Từ {formatCurrency(service.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="group-hover:gap-2"
                    onClick={() => handleServiceClick(service as Service)}
                  >
                    Đặt dịch vụ
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-[18px] border border-[#1E293B] bg-[#111827] p-8 text-center">
          <h3 className="font-sora text-xl font-bold text-white mb-2">
            Cần dịch vụ tùy chỉnh?
          </h3>
          <p className="text-[#94A3B8] mb-6">
            Liên hệ với chúng tôi để được tư vấn dịch vụ Facebook theo nhu cầu riêng
          </p>
          <Link href="/lien-he">
            <Button>
              <MessageSquare className="h-4 w-4" />
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
