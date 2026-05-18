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
} from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-3">
            Liên hệ hỗ trợ
          </h1>
          <p className="text-[#94A3B8] max-w-lg mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Điền thông tin và gửi yêu cầu.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: MessageSquare, title: "Zalo", value: "ShopAccount", desc: "Phản hồi trong 5 phút" },
              { icon: Mail, title: "Email", value: "support@shopaccount.vn", desc: "Phản hồi trong 1 giờ" },
              { icon: Phone, title: "Hotline", value: "0901 234 567", desc: "8:00 - 22:00 hàng ngày" },
              { icon: MapPin, title: "Địa chỉ", value: "TP. Hồ Chí Minh, Việt Nam", desc: "Văn phòng làm việc" },
            ].map((item, i) => (
              <Card key={i} className="!rounded-[16px]">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#3B82F6]/10">
                    <item.icon className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748B]">{item.title}</p>
                    <p className="font-medium text-white">{item.value}</p>
                    <p className="text-xs text-[#64748B]">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-4 text-center">
              <Clock className="h-5 w-5 text-[#22C55E] mx-auto mb-2" />
              <p className="text-sm text-white font-medium mb-1">Giờ làm việc</p>
              <p className="text-xs text-[#94A3B8]">Thứ 2 - Thứ 7: 8:00 - 22:00</p>
              <p className="text-xs text-[#94A3B8]">Chủ nhật: 9:00 - 21:00</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="!rounded-[16px]">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Gửi yêu cầu hỗ trợ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Họ và tên" placeholder="Nhập họ và tên" />
                  <Input label="Email" type="email" placeholder="Nhập email" />
                </div>
                <Input label="Số điện thoại" type="tel" placeholder="Nhập số điện thoại" />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#94A3B8]">Nội dung</label>
                  <textarea
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    rows={5}
                    className="w-full rounded-[12px] border border-[#1E293B] bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 resize-none"
                  />
                </div>
                <Button size="lg" className="w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Gửi yêu cầu
                </Button>

                <div className="flex items-start gap-2 rounded-[12px] border border-[#3B82F6]/30 bg-[#3B82F6]/5 p-3">
                  <Shield className="h-4 w-4 text-[#3B82F6] mt-0.5" />
                  <p className="text-xs text-[#94A3B8]">
                    Thông tin của bạn được bảo mật hoàn toàn. Chúng tôi không chia sẻ thông tin cá nhân với bất kỳ bên thứ ba nào.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
