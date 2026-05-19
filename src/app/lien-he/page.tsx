"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  MapPin,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12 lg:py-20 bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            Liên hệ hỗ trợ
          </Badge>
          <h1 className="font-sora text-3xl lg:text-5xl font-bold text-text-primary mb-4">
            Chúng Tôi Luôn <span className="gradient-text">Sẵn Sàng Hỗ Trợ</span>
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Hệ thống hỗ trợ 24/7. Mọi thắc mắc về đơn hàng, nạp tiền hoặc dịch vụ, 
            vui lòng gửi yêu cầu để được xử lý nhanh nhất.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="space-y-4">
              {[
                { icon: MessageSquare, title: "Zalo", value: "ShopAccount", desc: "Phản hồi trong 5 phút", color: "bg-blue-500/10 text-blue-500" },
                { icon: Mail, title: "Email", value: "support@shopaccount.vn", desc: "Phản hồi trong 1 giờ", color: "bg-primary/10 text-primary" },
                { icon: Phone, title: "Hotline", value: "0901 234 567", desc: "8:00 - 22:00 hàng ngày", color: "bg-success/10 text-success" },
                { icon: MapPin, title: "Địa chỉ", value: "TP. Hồ Chí Minh, Việt Nam", desc: "Văn phòng làm việc", color: "bg-secondary/10 text-secondary" },
              ].map((item, i) => (
                <Card key={i} hover className="border-border/50 bg-bg-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{item.title}</p>
                      <p className="font-sora font-semibold text-text-primary">{item.value}</p>
                      <p className="text-xs text-text-secondary">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Working Hours */}
            <Card className="border-primary/20 bg-bg-card overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Clock className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-sora font-bold text-text-primary">Giờ làm việc</h3>
                    <p className="text-xs text-success font-medium">Đang hoạt động</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Thứ 2 - Thứ 7</span>
                    <span className="font-semibold text-text-primary">08:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Chủ nhật</span>
                    <span className="font-semibold text-text-primary">09:00 - 21:00</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Hỗ trợ kỹ thuật 24/7 qua Ticket
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Card className="border-border/50 bg-bg-card h-full">
              <CardHeader className="p-6 lg:p-8 pb-3">
                <CardTitle className="text-text-primary text-2xl font-bold flex items-center gap-3">
                  <Send className="h-6 w-6 text-primary" />
                  Gửi yêu cầu hỗ trợ
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  Chúng tôi sẽ phản hồi bạn qua Email hoặc Số điện thoại trong thời gian sớm nhất.
                </p>
              </CardHeader>
              <CardContent className="p-6 lg:p-8 pt-0 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input label="Họ và tên" placeholder="Ví dụ: Nguyễn Văn A" />
                  <Input label="Email" type="email" placeholder="email@gmail.com" />
                </div>
                <Input label="Số điện thoại" type="tel" placeholder="090x xxx xxx" />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Nội dung yêu cầu</label>
                  <textarea
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải (mã đơn hàng, lỗi nạp tiền...)"
                    rows={6}
                    className="w-full rounded-[14px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary transition-all duration-300 placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none backdrop-blur-md dark:backdrop-blur-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <Button size="xl" className="w-full sm:w-auto px-12 group">
                    Gửi yêu cầu 
                    <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Button>
                  
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <Shield className="h-4 w-4 text-success" />
                    Bảo mật thông tin 100%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
