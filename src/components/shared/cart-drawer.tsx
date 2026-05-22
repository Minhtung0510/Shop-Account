"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore, useUIStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const isOpen = useUIStore((s) => s.isCartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) => s.getTotal());
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#1E293B] bg-[#0F172A] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] p-4">
              <h2 className="font-sora text-lg font-bold text-white">Giỏ hàng</h2>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!mounted || items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-4 text-[#64748B]">
                    <svg
                      className="mx-auto h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-[#94A3B8]">Giỏ hàng trống</p>
                  <Link href="/tai-khoan" onClick={closeCart}>
                    <Button className="mt-4" size="sm">
                      Khám phá sản phẩm
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <Card key={item.product.id} className="!rounded-[14px]">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-[10px] bg-[#1F2937] relative">
                            <Image
                              src={item.product.thumbnail || "/placeholder.png"}
                              alt={item.product.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <h4 className="text-sm font-medium text-white line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-sm font-bold text-[#3B82F6]">
                              {formatCurrency(item.product.price)}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#1E293B] bg-[#111827] text-xs text-[#94A3B8] hover:bg-[#1F2937]"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                                className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#1E293B] bg-[#111827] text-xs text-[#94A3B8] hover:bg-[#1F2937]"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="ml-auto text-xs text-[#EF4444] hover:underline"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {mounted && items.length > 0 && (
              <div className="border-t border-[#1E293B] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Tổng cộng</span>
                  <span className="font-sora text-xl font-bold text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={clearCart}
                  >
                    Xóa all
                  </Button>
                  <Link href="/gio-hang" className="flex-1" onClick={closeCart}>
                    <Button className="w-full">Thanh toán</Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
