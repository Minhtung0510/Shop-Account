"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Zap,
} from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [showAccounts, setShowAccounts] = useState(false);
  const clearCart = useCartStore((s) => s.clearCart);

  const orderId = "ORD" + Date.now().toString().slice(-8);
  const orderTime = new Date().toLocaleString("vi-VN");

  const accounts = [
    { label: "Email", value: "netflix_premium@example.com", pass: "Netflix2026!" },
    { label: "Netflix Premium", value: "netflix_acc@example.com", pass: "Pass123!" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg text-center"
      >
        {/* Success Icon */}
        <div className="mb-6">
          <div className="relative mx-auto w-24 h-24 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#22C55E]/20 flex items-center justify-center animate-pulse">
              <CheckCircle className="h-12 w-12 text-[#22C55E]" />
            </div>
          </div>
        </div>

        <h1 className="font-sora text-3xl font-bold text-white mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-[#94A3B8] mb-6">
          Cảm ơn bạn đã mua hàng. Tài khoản đã được gửi đến email của bạn.
        </p>

        {/* Order Info */}
        <Card className="!rounded-[18px] mb-6">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Mã đơn hàng</span>
              <span className="font-mono font-medium text-[#3B82F6]">{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Thời gian</span>
              <span className="text-white">{orderTime}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B]">Phương thức</span>
              <span className="text-white">Số dư tài khoản</span>
            </div>
            <div className="border-t border-[#1E293B] pt-3 flex justify-between">
              <span className="font-medium text-white">Tổng cộng</span>
              <span className="font-sora text-xl font-bold text-[#3B82F6]">{formatCurrency(49000)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="!rounded-[18px] mb-6 text-left">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              Tài khoản của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {accounts.map((acc, i) => (
              <div key={i} className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                <p className="text-xs text-[#64748B] mb-2">{acc.label}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-[8px] bg-[#111827] p-2">
                    <span className="text-sm text-white font-mono">{acc.value}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(acc.value);
                        toast.success("Đã copy!");
                      }}
                      className="text-[#64748B] hover:text-white transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-[8px] bg-[#111827] p-2">
                    <span className="text-sm text-white font-mono">
                      {showAccounts ? acc.pass : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowAccounts(!showAccounts)}
                      className="text-[#64748B] hover:text-white transition-colors"
                    >
                      {showAccounts ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-[12px] border border-[#F59E0B]/30 bg-[#F59E0B]/5 p-3">
              <p className="text-xs text-[#F59E0B] flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Clock, text: "Giao tài khoản ngay" },
            { icon: Shield, text: "Bảo hành 1 tháng" },
            { icon: Zap, text: "Hỗ trợ 24/7" },
          ].map((item, i) => (
            <div key={i} className="rounded-[12px] border border-[#1E293B] bg-[#111827] p-3 text-center">
              <item.icon className="h-5 w-5 text-[#3B82F6] mx-auto mb-1" />
              <p className="text-xs text-[#94A3B8]">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/lich-su" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Xem đơn hàng
            </Button>
          </Link>
          <Link href="/tai-khoan" className="flex-1">
            <Button className="w-full">
              Tiếp tục mua
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
