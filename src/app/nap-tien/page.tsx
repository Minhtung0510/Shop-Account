"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store";
import { useUserStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Wallet,
  QrCode,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Shield,
  History,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function NapTienPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const settings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const userBalance = useUserStore((s) => s.user?.balance ?? session?.user?.balance ?? 0);

  const [amount, setAmount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrData, setQrData] = useState<{
    qrImageUrl: string;
    topupId: string;
    transferContent: string;
    bank: { name: string; bin: string; accountNumber: string; accountName: string };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
    fetchUser();
  }, []);

  const handleSelectQuickAmount = (val: number) => {
    setSelectedAmount(val);
    setAmount(val.toString());
    setQrData(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
    setSelectedAmount(null);
    setQrData(null);
  };

  const generateQR = useCallback(async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1000) {
      toast.error("Số tiền nạp tối thiểu là 1,000đ");
      return;
    }

    setQrLoading(true);
    try {
      const res = await fetch("/api/vietqr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể tạo mã QR");
        return;
      }

      const imageUrl = data.qrImageUrl || data.qrDataURL;
      if (!imageUrl) {
        toast.error("Không tạo được mã QR. Vui lòng thử lại.");
        return;
      }

      setQrData({
        qrImageUrl: imageUrl,
        topupId: data.topupId,
        transferContent: data.transferContent,
        bank: data.bank,
      });
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setQrLoading(false);
    }
  }, [amount]);

  const handleManualRefresh = useCallback(() => {
    toast.info("Vui lòng đợi admin xác nhận. Bạn có thể kiểm tra trạng thái tại trang Lịch sử nạp tiền.");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchUser();
  }, [mounted]);

  const handleCopyContent = () => {
    if (!qrData?.transferContent) return;
    navigator.clipboard.writeText(qrData.transferContent);
    setCopied(true);
    toast.success("Đã sao chép nội dung chuyển khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQR = () => {
    if (!amount) return;
    setQrData(null);
    generateQR();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-sora text-xl font-bold text-white mb-4">Vui lòng đăng nhập</h2>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Amount Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="!rounded-[16px]">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#3B82F6]/20">
                    <Wallet className="h-5 w-5 text-[#3B82F6]" />
                  </div>
                  Nạp tiền qua VietQR
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {/* Balance info */}
                <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#64748B]">Số dư hiện tại</span>
                    <span className="font-sora text-lg font-bold text-[#22C55E]">
                      {formatCurrency(userBalance)}
                    </span>
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#94A3B8]">
                    Nhập số tiền muốn nạp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amount ? Number(amount).toLocaleString("vi-VN") : ""}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full rounded-[12px] border border-[#1E293B] bg-[#0F172A] px-4 py-3 pr-14 text-xl font-bold text-white placeholder-[#334155] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[#64748B]">
                      VNĐ
                    </span>
                  </div>
                  {amount && Number(amount) > 0 && Number(amount) < 1000 && (
                    <p className="mt-1 text-sm text-[#EF4444]">Số tiền tối thiểu là 1,000đ</p>
                  )}
                </div>

                {/* Quick amounts */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#94A3B8]">
                    Chọn nhanh số tiền
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <button
                        key={val}
                        onClick={() => handleSelectQuickAmount(val)}
                        className={`rounded-[10px] border py-2.5 text-sm font-semibold transition-all ${
                          selectedAmount === val
                            ? "border-[#3B82F6] bg-[#3B82F6]/20 text-[#3B82F6]"
                            : "border-[#1E293B] bg-[#0F172A] text-[#94A3B8] hover:border-[#334155]"
                        }`}
                      >
                        {formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate QR button */}
                <Button
                  onClick={generateQR}
                  disabled={!amount || Number(amount) < 1000 || qrLoading}
                  loading={qrLoading}
                  size="lg"
                  className="w-full"
                >
                  <QrCode className="h-4 w-4" />
                  Tạo mã QR
                </Button>

                {/* Transfer info */}
                <div className="rounded-[12px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-semibold">
                    <Info className="h-4 w-4" />
                    Hướng dẫn nạp tiền
                  </div>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-[#94A3B8]">
                    <li>Nhập số tiền và bấm &quot;Tạo mã QR&quot;</li>
                    <li>Quét mã bằng app ngân hàng (đúng số tiền và nội dung CK)</li>
                    <li>Sau khi chuyển khoản, admin sẽ xác nhận trong vài phút</li>
                    <li>Nạp tiền thành công sẽ được thông báo tại trang Lịch sử nạp tiền</li>
                    <li>Không sửa nội dung chuyển khoản — hệ thống nhận diện qua mã NAPTIEN</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: QR Display */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="!rounded-[16px]">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#22C55E]/20">
                    <QrCode className="h-5 w-5 text-[#22C55E]" />
                  </div>
                  {qrData ? "Mã thanh toán" : "Thông tin chuyển khoản"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {!qrData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-[#1F2937] p-6">
                      <QrCode className="h-16 w-16 text-[#334155]" />
                    </div>
                    <h3 className="mb-2 font-sora text-lg font-semibold text-white">
                      Nhập số tiền để tạo mã QR
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      Mã QR sẽ hiển thị tại đây sau khi bạn nhấn "Tạo mã QR"
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Amount display */}
                    <div className="text-center">
                      <p className="text-sm text-[#64748B]">Số tiền cần thanh toán</p>
                      <p className="font-sora text-3xl font-bold text-[#22C55E]">
                        {formatCurrency(Number(amount))}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="rounded-[16px] border border-[#1E293B] bg-white p-4">
                        <img
                          src={qrData.qrImageUrl}
                          alt="VietQR"
                          className="h-[220px] w-[220px] object-contain"
                          onError={() => toast.error("Không tải được ảnh QR. Bấm Tạo lại mã.")}
                        />
                      </div>
                    </div>

                    {/* Transfer content */}
                    <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Nội dung chuyển khoản</span>
                        <button
                          onClick={handleCopyContent}
                          className="flex items-center gap-1 text-xs text-[#3B82F6] hover:underline"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3 w-3" />
                              Đã sao chép
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Sao chép
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-lg font-bold text-white break-all">
                        {qrData.transferContent}
                      </p>
                    </div>

                    {/* Bank info */}
                    <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Ngân hàng</span>
                        <span className="text-sm font-medium text-white">{qrData.bank.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Số tài khoản</span>
                        <span className="font-mono text-sm font-medium text-white">
                          {qrData.bank.accountNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#64748B]">Tên tài khoản</span>
                        <span className="text-sm font-medium text-white">{qrData.bank.accountName}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleRefreshQR}
                        disabled={qrLoading}
                        className="flex-1"
                      >
                        <RefreshCw className={`h-4 w-4 ${qrLoading ? "animate-spin" : ""}`} />
                        Tạo lại mã
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleManualRefresh}
                        className="flex-1 border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/10"
                      >
                        <Check className="h-4 w-4" />
                        Đã chuyển khoản
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-[#64748B]">
                      <Shield className="h-3 w-3" />
                      Thanh toán an toàn qua VietQR
                    </div>
                  </>
                )}

                {/* View history */}
                <div className="border-t border-[#1E293B] pt-4">
                  <Link href="/lich-su-nap-tien">
                    <Button variant="ghost" className="w-full text-[#94A3B8]">
                      <History className="h-4 w-4" />
                      Xem lịch sử nạp tiền
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
