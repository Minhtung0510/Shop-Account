"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore, useUserStore } from "@/store";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  QrCode,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@/hooks/useSession";

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.getTotal());
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUser = useUserStore((s) => s.fetchUser);
  const userFromStore = useUserStore((s) => s.user);

  const handleCheckout = async () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      router.push("/login");
      return;
    }

    if ((userFromStore?.balance ?? session.user.balance) < total) {
      toast.error("Số dư không đủ. Vui lòng nạp thêm tiền!");
      router.push("/nap-tien");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
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
        if (res.status === 401) {
          toast.error("Vui lòng đăng nhập để thanh toán");
          router.push("/login");
          return;
        }
        if (res.status === 402) {
          toast.error("Số dư không đủ. Vui lòng nạp thêm tiền!");
          router.push("/nap-tien");
          return;
        }
        throw new Error(data.error || "Thanh toán thất bại");
      }

      clearCart();
      await fetchUser();
      toast.success("Thanh toán thành công!", {
        description: `Đã thanh toán ${formatCurrency(data.totalAmount)}. Tài khoản đang được gửi...`,
      });
      router.push(`/thanh-toan-thanh-cong?orderId=${data.orderId}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12">
        <div className="animate-pulse text-center">
          <ShoppingCart className="h-20 w-20 text-[#334155] mx-auto mb-4" />
          <p className="text-[#64748B]">�ang tai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sora text-3xl font-bold text-white mb-1">Giỏ hàng</h1>
            <p className="text-[#94A3B8]">{items.length} sản phẩm trong giỏ hàng</p>
          </div>
          <Link href="/tai-khoan">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Tiếp tục mua
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-6 text-[#64748B]">
              <ShoppingCart className="h-20 w-20" />
            </div>
            <h2 className="font-sora text-xl font-bold text-white mb-2">Giỏ hàng trống</h2>
            <p className="text-[#94A3B8] mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            <Link href="/tai-khoan">
              <Button>
                <ArrowRight className="h-4 w-4" />
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="!rounded-[16px]">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-[#1F2937]">
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-sora font-semibold text-white">{item.product.name}</h3>
                              <p className="text-xs text-[#64748B]">{item.product.category.name}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[#1E293B] rounded-[10px] overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-[#1F2937]"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center text-sm text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center text-[#94A3B8] hover:bg-[#1F2937]"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="font-sora text-lg font-bold text-[#3B82F6]">
                              {formatCurrency(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              <button
                onClick={clearCart}
                className="text-sm text-[#EF4444] hover:underline"
              >
                Xóa tất cả sản phẩm
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <Card className="!rounded-[16px] sticky top-24">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-white">Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="space-y-2 text-sm">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="text-[#94A3B8]">{item.product.name} x{item.quantity}</span>
                        <span className="text-white">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#1E293B] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Tạm tính</span>
                      <span className="text-white">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {session && (
                    <div className="flex justify-between">
                      <span className="text-[#94A3B8]">Số dư hiện có</span>
                      <span className={session.user.balance >= total ? "text-[#22C55E]" : "text-[#EF4444]"}>
                        {formatCurrency(userFromStore?.balance ?? session.user.balance)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#1E293B] pt-3 flex justify-between">
                    <span className="font-semibold text-white">Tổng cộng</span>
                    <span className="font-sora text-xl font-bold text-white">{formatCurrency(total)}</span>
                  </div>

                  {session && (userFromStore?.balance ?? session.user.balance) < total && (
                    <div className="rounded-[12px] border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3 text-sm text-[#F59E0B]">
                      Số dư không đủ. Cần nạp thêm {formatCurrency(total - (userFromStore?.balance ?? session.user.balance))}
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    size="lg"
                    className="w-full"
                    loading={loading}
                  >
                    <CreditCard className="h-4 w-4" />
                    Thanh toán ngay
                  </Button>

                  {session && (userFromStore?.balance ?? session.user.balance) < total && (
                    <Link href="/thanh-toan-qr" className="block">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-[#F59E0B]/50 text-[#F59E0B] hover:bg-[#F59E0B]/10"
                      >
                        <QrCode className="h-4 w-4" />
                        Thanh toán qua VietQR
                      </Button>
                    </Link>
                  )}

                  {!session && (
                    <p className="text-xs text-center text-[#64748B]">
                      Vui lòng{" "}
                      <Link href="/login" className="text-[#3B82F6] hover:underline">
                        đăng nhập
                      </Link>{" "}
                      để thanh toán
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] pt-2">
                    <Shield className="h-3 w-3" />
                    Thanh toán an toàn & Bảo mật
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
