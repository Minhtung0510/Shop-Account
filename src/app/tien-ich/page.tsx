"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, ShieldCheck, Key, Search, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "check-live-uid",
    name: "Check Live UID",
    description: "Kiểm tra trạng thái hoạt động của danh sách UID Facebook nhanh chóng.",
    icon: ShieldCheck,
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: "get-uid",
    name: "Get UID Facebook",
    description: "Lấy ID người dùng, Fanpage, Group từ đường dẫn liên kết Facebook.",
    icon: Search,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "get-2fa",
    name: "Get 2FA Code",
    description: "Lấy mã xác thực 2 lớp (2FA) từ mã bảo mật (Key 2FA).",
    icon: Key,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "check-live-proxy",
    name: "Check Live Proxy",
    description: "Kiểm tra tốc độ và trạng thái kết nối của danh sách Proxy.",
    icon: Globe,
    color: "bg-orange-500/10 text-orange-500",
  },
];

export default function UtilitiesPage() {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-up">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            <Wrench className="mr-1.5 h-3.5 w-3.5" />
            Công cụ & Tiện ích
          </Badge>
          <h1 className="font-sora text-3xl lg:text-5xl font-bold text-text-primary mb-4">
            Hệ Thống <span className="gradient-text">Tiện Ích Miễn Phí</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Tổng hợp các công cụ hỗ trợ làm việc với tài khoản MXH hiệu quả hơn. 
            Hoàn toàn miễn phí và không lưu trữ dữ liệu người dùng.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {tools.map((tool) => (
            <Card key={tool.id} hover className="group border-border/50 bg-bg-card transition-all duration-300 hover:border-primary">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className={cn(
                    "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] transition-transform duration-300 group-hover:scale-110",
                    tool.color
                  )}>
                    <tool.icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-sora text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-text-secondary mb-6">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-full px-6">
                        Sử dụng ngay <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="rounded-full px-6">
                        Hướng dẫn
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 rounded-[32px] border border-border bg-bg-card p-8 lg:p-12 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-sora text-2xl lg:text-3xl font-bold text-text-primary mb-6">
                Tại sao nên sử dụng công cụ của chúng tôi?
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Tốc độ cực nhanh", desc: "Xử lý hàng nghìn dữ liệu chỉ trong vài giây." },
                  { title: "Không lưu trữ dữ liệu", desc: "Mọi thông tin bạn nhập vào đều được xử lý tại trình duyệt." },
                  { title: "Giao diện thân thiện", desc: "Dễ dàng sử dụng trên cả máy tính và điện thoại." },
                  { title: "Luôn cập nhật", desc: "Công cụ được cập nhật thường xuyên theo thay đổi của MXH." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">{item.title}</h4>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-video rounded-[24px] overflow-hidden border border-border bg-bg-primary p-4">
               {/* Decorative elements */}
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
               <div className="relative h-full w-full rounded-[16px] border border-border bg-bg-card p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <div className="h-3 w-3 rounded-full bg-error/40" />
                    <div className="h-3 w-3 rounded-full bg-warning/40" />
                    <div className="h-3 w-3 rounded-full bg-success/40" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-full rounded-lg bg-bg-primary border border-border animate-skeleton" />
                    <div className="h-32 w-full rounded-lg bg-bg-primary border border-border animate-skeleton" />
                    <div className="h-10 w-40 rounded-lg bg-primary/20 animate-skeleton" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
