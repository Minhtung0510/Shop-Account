"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore, useUserStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  QrCode,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Shield,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";

function QRPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchUser = useUserStore((s) => s.fetchUser);
  const total = useCartStore((s) => s.getTotal());

  const [qrData, setQrData] = useState<{
    orderId: string;
    qrImageUrl: string;
    transferContent: string;
    totalAmount: number;
    bank: { name: string; bin: string; accountNumber: string; accountName: string };
    items: { productName: string; quantity: number; price: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createQRPayment = useCallback(async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      router.push("/gio-hang");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/orders/qr-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Không thể tạo mã thanh toán");
        return;
      }

      setQrData({
        orderId: data.orderId,
        qrImageUrl: data.qrImageUrl || data.qrDataURL,
        transferContent: data.transferContent,
        totalAmount: data.totalAmount,
        bank: data.bank,
        items: data.items,
      });
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, [session, items, router]);

  useEffect(() => {
    if (mounted && session && items.length > 0 && !qrData) {
      createQRPayment();
    }
  }, [mounted, session, items, qrData, createQRPayment]);

  const handleCopyContent = () => {
    if (!qrData?.transferContent) return;
    navigator.clipboard.writeText(qrData.transferContent);
    setCopied(true);
    toast.success("Đã sao chép nội dung chuyển khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshQR = () => {
    setQrData(null);
    setGenerating(true);
    createQRPayment();
  };

  const pollOrderStatus = useCallback(async () => {
    if (!qrData?.orderId) return;
    setPolling(true);

    try {
      const res = await fetch(`/api/orders/qr-status?orderId=${qrData.orderId}`);
      const data = await res.json();

      if (data.status === "SUCCESS") {
        setPaymentStatus("success");
        clearCart();
        await fetchUser();
        toast.success("Thanh toán thành công!");
        router.push(`/thanh-toan-thanh-cong?orderId=${qrData.orderId}`);
        return;
      }
    } catch {
      // ignore
    } finally {
      setPolling(false);
    }
  }, [qrData, clearCart, fetchUser, router]);

  useEffect(() => {
    if (!qrData?.orderId || paymentStatus === "success" || !mounted) return;

    const interval = setInterval(() => {
      pollOrderStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [qrData?.orderId, paymentStatus, mounted, pollOrderStatus]);

  const handleManualConfirm = async () => {
    if (!qrData?.orderId) return;
    setConfirming(true);

    try {
      const res = await fetch("/api/orders/qr-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: qrData.orderId }),
      });

      const data = await res.json();

      if (data.success || data.status === "SUCCESS") {
        setPaymentStatus("success");
        clearCart();
        await fetchUser();
        toast.success("Thanh toán thành công!");
        router.push(`/thanh-toan-thanh-cong?orderId=${qrData.orderId}`);
      } else {
        toast.error(data.error || "Xác nhận thất bại. Vui lòng liên hệ admin.");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setConfirming(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6]" />
        <p className="text-[#94A3B8]">Đang tạo mã thanh toán...</p>
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

  if (items.length === 0 && !qrData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-[#334155] mx-auto mb-4" />
          <h2 className="font-sora text-xl font-bold text-white mb-4">Giỏ hàng trống</h2>
          <Link href="/tai-khoan">
            <Button>Khám phá sản phẩm</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#22C55E]/20 mx-auto">
            <CheckCircle className="h-10 w-10 text-[#22C55E]" />
          </div>
          <h2 className="font-sora text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
          <p className="text-[#94A3B8] mb-6">Tài khoản của bạn đang được gửi qua email...</p>
          <Link href="/thanh-toan-thanh-cong">
            <Button>Xem chi tiết đơn hàng</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/gio-hang" className="flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại giỏ hàng</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Order Summary */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="!rounded-[16px]">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-sora text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#3B82F6]" />
                  Thông tin đơn hàng
                </h2>

                {/* Order items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-3">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] bg-[#1F2937]">
                        <img
                          src={item.product.thumbnail}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-[#64748B]">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#3B82F6]">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1E293B] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Tổng tiền</span>
                    <span className="font-sora text-xl font-bold text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Payment method badge */}
                <div className="rounded-[10px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3">
                  <div className="flex items-center gap-2 text-[#F59E0B] text-sm font-semibold">
                    <QrCode className="h-4 w-4" />
                    Thanh toán qua VietQR
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: QR Payment */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="!rounded-[16px]">
              <CardContent className="p-6 space-y-6">
                {!qrData ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6] mb-4" />
                    <p className="text-[#94A3B8]">Đang tạo mã thanh toán...</p>
                  </div>
                ) : (
                  <>
                    {/* Amount */}
                    <div className="text-center">
                      <p className="text-sm text-[#64748B]">Số tiền cần thanh toán</p>
                      <p className="font-sora text-3xl font-bold text-[#3B82F6]">
                        {formatCurrency(qrData.totalAmount)}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="rounded-[16px] border border-[#1E293B] bg-white p-4">
                        <img
                          src={qrData.qrImageUrl}
                          alt="VietQR Thanh toán"
                          className="h-[220px] w-[220px] object-contain"
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
                        disabled={generating}
                        className="flex-1"
                      >
                        <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                        Tạo lại mã
                      </Button>
                      <Button
                        onClick={handleManualConfirm}
                        disabled={confirming}
                        loading={confirming}
                        className="flex-1 bg-[#22C55E] hover:bg-[#16A34A]"
                      >
                        <Check className="h-4 w-4" />
                        Đã chuyển khoản
                      </Button>
                    </div>

                    {/* Polling indicator */}
                    {polling && (
                      <div className="flex items-center justify-center gap-2 text-sm text-[#22C55E]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang kiểm tra thanh toán... (5s)
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-start gap-2 rounded-[12px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3 text-sm text-[#F59E0B]">
                      <Timer className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận trong vài giây.
                        Nếu không tự động, hãy bấm nút "Đã chuyển khoản".
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-[#64748B]">
                      <Shield className="h-3 w-3" />
                      Thanh toán an toàn qua VietQR
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function QRPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      }
    >
      <QRPaymentContent />
    </Suspense>
  );
}
