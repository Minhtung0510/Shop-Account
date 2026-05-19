"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Camera,
  ArrowRight,
  Clock,
  Shield,
  Star,
} from "lucide-react";

export default function InstagramServicesPage() {
  const [services, setServices] = useState<Array<{
    id: string; name: string; icon: string; price: number;
    description: string; category: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services?platform=Instagram")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setServices(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E4405F]/30 bg-[#E4405F]/10 px-4 py-1.5 text-sm text-[#E4405F] mb-4">
            <Camera className="h-4 w-4" />
            Dịch vụ Instagram
          </div>
          <h1 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-2">
            Dịch vụ hỗ trợ Instagram
          </h1>
          <p className="text-[#94A3B8]">
            Các dịch vụ hỗ trợ tài khoản Instagram chuyên nghiệp
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Clock, text: "Xử lý nhanh 1-24h" },
            { icon: Shield, text: "Cam kết hoàn tiền" },
            { icon: Star, text: "Đánh giá 4.9/5" },
          ].map((item, i) => (
            <div key={i} className="rounded-[14px] border border-[#1E293B] bg-[#111827] p-4 text-center">
              <item.icon className="h-6 w-6 text-[#E4405F] mx-auto mb-2" />
              <p className="text-sm text-white font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading ? [] : services).map((service) => (
            <Card key={service.id} hover className="group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E4405F] to-[#F77737]">
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
                    <p className="font-sora text-xl font-bold text-[#E4405F]">
                      Từ {formatCurrency(service.price)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="group-hover:gap-2"
                    onClick={() => window.location.href = "/lien-he"}
                  >
                    Liên hệ
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
            Liên hệ với chúng tôi để được tư vấn dịch vụ Instagram theo nhu cầu riêng
          </p>
          <Link href="/lien-he">
            <Button>
              <Camera className="h-4 w-4" />
              Liên hệ hỗ trợ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
