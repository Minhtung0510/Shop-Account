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
    <div className="min-h-screen py-8 bg-bg-primary">
      <div className="mx-auto max-w-[800px] px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-sora text-3xl font-bold text-text-primary mb-2">Nạp tiền</h1>
          <p className="text-text-secondary">Quét mã QR để nạp tiền vào tài khoản</p>
        </div>

        {mounted && session && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-[12px] border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Wallet className="h-4 w-4" />
            Số dư hiện tại: <span className="font-bold">{formatCurrency(session.user.balance)}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left - Form */}
          <div className="space-y-4">
            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-text-primary flex items-center gap-2">
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
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-border-hover"
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{b.icon}</span>
                      <span className="text-xs text-text-secondary">{b.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="!rounded-[16px]">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-text-primary flex items-center gap-2">
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
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-text-secondary hover:border-border-hover"
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  ))}
                </div>

                <div className="rounded-[12px] border border-border bg-bg-primary p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-muted">Số tiền nạp</span>
                    <span className="font-bold text-text-primary">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Phí</span>
                    <span className="text-success">Miễn phí</span>
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
                <CardTitle className="text-text-primary text-center">Mã QR thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                {!qrGenerated ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-bg-primary p-6 mb-4">
                      <QrCode className="h-16 w-16 text-text-muted" />
                    </div>
                    <p className="text-text-secondary text-sm">
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
                    <div className="relative mx-auto rounded-[16px] border border-border bg-white p-4 w-64">
                      <div className="aspect-square bg-[#f0f0f0] rounded-[8px] flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">{bank?.icon}</div>
                          <p className="text-xs text-gray-500 font-medium">{bank?.name}</p>
                        </div>
                      </div>
                      {countdown > 0 && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-error font-medium">
                            ⏰ Hết hạn sau: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bank Info */}
                    <div className="rounded-[12px] border border-border bg-bg-primary p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Ngân hàng</span>
                        <span className="text-text-primary font-medium">{bank?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Số tiền</span>
                        <span className="text-primary font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">STK</span>
                        <span className="text-text-primary font-mono">1234567890</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-muted">Tên TK</span>
                        <span className="text-text-primary">SHOP ACCOUNT</span>
                      </div>
                    </div>

                    {/* Transfer Content */}
                    <div className="rounded-[12px] border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                      <p className="text-xs text-text-muted mb-2">Nội dung chuyển khoản (BẮT BUỘC)</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary text-lg">{transferContent}</span>
                        <button
                          onClick={copyTransferContent}
                          className="flex items-center gap-1 rounded-[8px] bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors"
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copied ? "Đã copy" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-warning mt-2 flex items-center gap-1">
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

                <div className="rounded-[12px] border border-border bg-bg-card p-4">
                  <div className="text-xs text-text-secondary space-y-1">
                    <p className="font-medium text-text-primary mb-2">Hướng dẫn:</p>
                    <p>1. Mở app ngân hàng của bạn</p>
                    <p>2. Quét mã QR hoặc nhập thông tin</p>
                    <p>3. Nhập đúng nội dung chuyển khoản</p>
                    <p>4. Số dư sẽ được cộng sau 1-5 phút</p>
                  </div>
                </div>

                {!session && (
                  <p className="text-xs text-center text-text-muted">
                    Cần đăng nhập để nạp tiền.{" "}
                    <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
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
