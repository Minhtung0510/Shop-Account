"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockServices } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import { Sparkles, Facebook, Instagram, Music, ChevronRight, Zap } from "lucide-react";

export default function SocialMediaServicesPage() {
  const fbServices = mockServices.filter((s) => s.category === "Facebook");
  const igServices = mockServices.filter((s) => s.category === "Instagram");
  const ttServices = mockServices.filter((s) => s.category === "TikTok");

  return (
    <div className="min-h-screen py-12 lg:py-20 bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-up">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Dịch vụ mạng xã hội
          </Badge>
          <h1 className="font-sora text-3xl lg:text-5xl font-bold text-text-primary mb-4">
            Dịch Vụ <span className="gradient-text">MXH Chuyên Nghiệp</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Hỗ trợ tăng tương tác, bảo mật, và giải quyết các vấn đề trên Facebook, Instagram, TikTok.
            Hệ thống xử lý nhanh chóng, an toàn và bảo mật.
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="facebook" className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <TabsList className="mx-auto flex w-fit gap-2 bg-bg-card border border-border p-1.5 rounded-[18px] mb-12">
            <TabsTrigger value="facebook" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-text-secondary">
              <Facebook className="h-4 w-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="data-[state=active]:bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] data-[state=active]:text-white flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-text-secondary">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:text-white flex items-center gap-2 rounded-[14px] px-6 py-2.5 text-text-secondary">
              <Music className="h-4 w-4" />
              TikTok
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facebook" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fbServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </TabsContent>

          <TabsContent value="instagram" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {igServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </TabsContent>

          <TabsContent value="tiktok" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ttServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </TabsContent>
        </Tabs>

        {/* Why Choose Us */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
          {[
            { title: "Bảo mật tuyệt đối", desc: "Không yêu cầu mật khẩu tài khoản của bạn" },
            { title: "Hỗ trợ 24/7", desc: "Đội ngũ kỹ thuật hỗ trợ xuyên suốt quá trình" },
            { title: "Xử lý nhanh", desc: "Thời gian hoàn thành tối ưu cho khách hàng" },
            { title: "Bảo hành", desc: "Cam kết bảo hành cho các dịch vụ cung cấp" },
          ].map((item, i) => (
            <Card key={i} className="text-center border-border/50 bg-bg-card/50">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-sora font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: any }) {
  return (
    <Card hover className="group cursor-pointer border-border/50 bg-bg-card transition-all duration-300 hover:border-primary">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] bg-primary/10 group-hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">{service.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-sora font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-2">
              {service.description}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Giá từ</p>
                <p className="font-sora font-bold text-primary">
                  {formatCurrency(service.price)}
                </p>
              </div>
              <Button size="sm" variant="outline" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                Chi tiết <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
