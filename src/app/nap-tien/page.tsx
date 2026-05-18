"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useMockSession } from "@/lib/mock-auth";
import {
  QrCode,
  Copy,
  Check,
  Building,
  Wallet,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const banks = [
  { code: "VCB", name: "Vietcombank", color: "#004B9B", icon: "🏦" },
  { code: "MB", name: "MB Bank", color: "#C8102E", icon: "💳" },
  { code: "TPB", name: "TPBank", color: "#00A651", icon: "🏛️" },
  { code: "ACB", name: "ACB", color: "#00A859", icon: "🏦" },
  { code: "VPB", name: "VPBank", color: "#E30613", icon: "💰" },
  { code: "STC", name: "Sacombank", color: "#F7941D", icon: "🏦" },
];

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function TopupPage() {
  const { data: session } = useMockSession();
  const [selectedBank, setSelectedBank] = useState("VCB");
  const [amount, setAmount] = useState(100000);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const uid = session?.user?.id?.slice(-6).toUpperCase() || "ABC123";
  const transferContent = `UID_${uid}`;

  const bank = banks.find((b) => b.code === selectedBank);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const generateQR = () => {
    if (amount < 10000) {
      toast.error("Số tiền nạp tối thiểu là 10,000đ");
      return;
    }
    setQrGenerated(true);
    setCountdown(600);
    toast.success("Đã tạo mã QR. Vui lòng thanh toán trong 10 phút!");
  };

  const copyTransferContent = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    toast.success("Đã copy nội dung chuyển khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshQR = () => {
    setQrGenerated(false);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[800px] px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-sora text-3xl font-bold text-white mb-2">Nạp tiền</h1>
          <p className="text-[#94A3B8]">Quét mã QR để nạp tiền vào tài khoản</p>
        </div>

        {mounted && session && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-[12px] border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-2 text-sm text-[#3B82F6]">
            <Wallet className="h-4 w-4" />
            Số dư hiện tại: <span className="font-bold">{formatCurrency(session.user.balance)}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Form */}
          <div className="space-y-4">
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Chọn ngân hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {banks.map((b) => (
                    <button
                      key={b.code}
                      onClick={() => { setSelectedBank(b.code); setQrGenerated(false); }}
                      className={`rounded-[12px] border p-3 text-center transition-all ${
                        selectedBank === b.code
                          ? "border-[#3B82F6] bg-[#3B82F6]/10"
                          : "border-[#1E293B] hover:border-[#334155]"
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{b.icon}</span>
                      <span className="text-xs text-[#94A3B8]">{b.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Nhập số tiền
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(Number(e.target.value)); setQrGenerated(false); }}
                  placeholder="Nhập số tiền"
                  className="text-lg font-bold"
                />

                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => { setAmount(amt); setQrGenerated(false); }}
                      className={`rounded-[10px] border py-2 text-sm font-medium transition-all ${
                        amount === amt
                          ? "border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]"
                          : "border-[#1E293B] text-[#94A3B8] hover:border-[#334155]"
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>

                <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748B]">Số tiền nạp</span>
                    <span className="font-bold text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Phí</span>
                    <span className="text-[#22C55E]">Miễn phí</span>
                  </div>
                </div>

                <Button onClick={generateQR} size="lg" className="w-full">
                  <QrCode className="h-4 w-4" />
                  Tạo mã QR
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right - QR Code */}
          <div>
            <Card className="!rounded-[16px] sticky top-24">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-white text-center">Mã QR thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                {!qrGenerated ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-[#1F2937] p-6 mb-4">
                      <QrCode className="h-16 w-16 text-[#334155]" />
                    </div>
                    <p className="text-[#94A3B8] text-sm">
                      Chọn ngân hàng và nhập số tiền<br />để tạo mã QR
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* QR Code */}
                    <div className="relative mx-auto rounded-[16px] border border-[#1E293B] bg-white p-4 w-64">
                      <div className="aspect-square bg-[#f0f0f0] rounded-[8px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">{bank?.icon}</div>
                          <p className="text-xs text-gray-500 font-medium">{bank?.name}</p>
                        </div>
                      </div>
                      {countdown > 0 && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-[#EF4444] font-medium">
                            ⏰ Hết hạn sau: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bank Info */}
                    <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Ngân hàng</span>
                        <span className="text-white font-medium">{bank?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Số tiền</span>
                        <span className="text-[#3B82F6] font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">STK</span>
                        <span className="text-white font-mono">1234567890</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#64748B]">Tên TK</span>
                        <span className="text-white">SHOP ACCOUNT</span>
                      </div>
                    </div>

                    {/* Transfer Content */}
                    <div className="rounded-[12px] border-2 border-dashed border-[#3B82F6]/30 bg-[#3B82F6]/5 p-4">
                      <p className="text-xs text-[#64748B] mb-2">Nội dung chuyển khoản (BẮT BUỘC)</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#3B82F6] text-lg">{transferContent}</span>
                        <button
                          onClick={copyTransferContent}
                          className="flex items-center gap-1 rounded-[8px] bg-[#3B82F6]/10 px-3 py-1.5 text-sm text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Đã copy" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-[#F59E0B] mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Nếu sai nội dung, hệ thống không thể xác nhận tự động!
                      </p>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" onClick={refreshQR}>
                      <RefreshCw className="h-3 w-3" />
                      Tạo mã mới
                    </Button>
                  </motion.div>
                )}

                <div className="rounded-[12px] border border-[#1E293B] bg-[#111827] p-4">
                  <p className="text-xs text-[#64748B] space-y-1">
                    <p className="font-medium text-[#94A3B8] mb-2">Hướng dẫn:</p>
                    <p>1. Mở app ngân hàng của bạn</p>
                    <p>2. Quét mã QR hoặc nhập thông tin</p>
                    <p>3. Nhập đúng nội dung chuyển khoản</p>
                    <p>4. Số dư sẽ được cộng sau 1-5 phút</p>
                  </p>
                </div>

                {!session && (
                  <p className="text-xs text-center text-[#64748B]">
                    Cần đăng nhập để nạp tiền.{" "}
                    <Link href="/login" className="text-[#3B82F6] hover:underline">Đăng nhập</Link>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
