"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockServices } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Activity, Zap, ChevronRight, Star, ShieldCheck } from "lucide-react";

export default function InteractionServicesPage() {
  const interactionServices = mockServices.filter((s) => s.category === "Tương tác");

  return (
    <div className="min-h-screen py-12 lg:py-20 bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-up">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Dịch vụ tương tác
          </Badge>
          <h1 className="font-sora text-3xl lg:text-5xl font-bold text-text-primary mb-4">
            Tăng <span className="gradient-text">Tương Tác Siêu Tốc</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Giải pháp tăng Like, Follow, View cho các nền tảng MXH. 
            Hệ thống tự động, bảo hành không tụt, giá cạnh tranh nhất thị trường.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {interactionServices.map((service) => (
            <Card key={service.id} hover className="group border-border/50 bg-bg-card transition-all duration-300 hover:border-primary">
              <CardContent className="p-6">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <h3 className="font-sora text-lg font-bold text-text-primary mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-text-secondary mb-6 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Từ</p>
                    <p className="font-sora font-bold text-primary">
                      {formatCurrency(service.price)}
                    </p>
                  </div>
                  <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">
                    Mua ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
          {[
            { 
              icon: Zap, 
              title: "Tốc độ nhanh chóng", 
              desc: "Hệ thống bắt đầu chạy ngay sau khi tạo đơn hàng thành công." 
            },
            { 
              icon: ShieldCheck, 
              title: "An toàn & Bảo mật", 
              desc: "Sử dụng các tài khoản thật để tương tác, đảm bảo an toàn cho tài khoản của bạn." 
            },
            { 
              icon: Star, 
              title: "Chất lượng cao", 
              desc: "Lượt tương tác thật, duy trì ổn định và có chế độ bảo hành dài hạn." 
            },
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 p-6 rounded-[24px] border border-border bg-bg-card/30">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-sora font-semibold text-text-primary mb-1">{feature.title}</h4>
                <p className="text-xs text-text-secondary">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
