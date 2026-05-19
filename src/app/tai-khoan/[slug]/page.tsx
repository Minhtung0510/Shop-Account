"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store";
import { toast } from "sonner";
import {
  Star,
  ShoppingCart,
  Shield,
  RefreshCw,
  Clock,
  CheckCircle,
  Minus,
  Plus,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setProduct(null);
        }
        return;
      }
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`, {
      description: `Tổng: ${formatCurrency(product.price * quantity)}`,
      action: {
        label: "Xem giỏ hàng",
        onClick: () => router.push("/gio-hang"),
      },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    router.push("/gio-hang");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-sora text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h2>
          <Button onClick={() => router.push("/tai-khoan")}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#64748B] mb-6">
          <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tai-khoan" className="hover:text-white transition-colors">Tài khoản</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-[18px] overflow-hidden bg-[#111827] border border-[#1E293B]">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.badge && (
                  <Badge
                    variant={
                      product.badge === "BEST_SELLER" ? "orange" :
                      product.badge === "HOT" ? "error" : "purple"
                    }
                    className="absolute left-4 top-4"
                  >
                    {product.badge === "BEST_SELLER" ? "🔥 Best Seller" :
                     product.badge === "HOT" ? "🔥 Hot" : "⭐ Premium"}
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {[product.thumbnail, product.thumbnail, product.thumbnail, product.thumbnail].map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square rounded-[12px] overflow-hidden border-2 transition-all",
                      activeImage === i ? "border-[#3B82F6]" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm text-[#64748B] mb-2">{product.category?.name}</p>
              <h1 className="font-sora text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating) ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#334155]"
                    )} />
                  ))}
                  <span className="text-sm text-[#94A3B8] ml-1">{product.rating}</span>
                </div>
                <span className="text-sm text-[#64748B]">|</span>
                <span className="text-sm text-[#64748B]">{product.sold.toLocaleString()} đã bán</span>
                <span className="text-sm text-[#64748B]">|</span>
                <span className="text-sm text-[#64748B]">Còn lại: <span className="text-[#22C55E]">{product.stock}</span></span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-5">
              <div className="flex items-end gap-3 mb-4">
                <span className="font-sora text-4xl font-bold text-[#3B82F6]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-[#64748B] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <Badge variant="error" className="mb-1">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-[#94A3B8]">Số lượng:</span>
                <div className="flex items-center border border-[#1E293B] rounded-[12px] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-[#94A3B8] hover:bg-[#1F2937] transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-16 h-10 text-center bg-transparent text-white border-x border-[#1E293B] text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="flex h-10 w-10 items-center justify-center text-[#94A3B8] hover:bg-[#1F2937] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-[#64748B]">
                  Tổng: <span className="font-bold text-white">{formatCurrency(product.price * quantity)}</span>
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleBuyNow} size="lg" className="flex-1">
                  <ShoppingCart className="h-4 w-4" />
                  Mua ngay
                </Button>
                <Button variant="outline" size="lg" className="flex-1" onClick={handleAddToCart}>
                  Thêm vào giỏ
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: "Bảo hành " + (product.warranty || "1 tháng") },
                { icon: Clock, text: "Giao tài khoản ngay" },
                { icon: RefreshCw, text: "Đổi trả nếu lỗi" },
                { icon: CheckCircle, text: "Hỗ trợ 24/7" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 rounded-[12px] border border-[#1E293B] bg-[#111827] px-3 py-2.5">
                  <item.icon className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-xs text-[#94A3B8]">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="policy">Chính sách</TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-6">
              <h3 className="font-sora text-lg font-semibold text-white mb-4">Mô tả sản phẩm</h3>
              <p className="text-[#94A3B8] leading-relaxed">{product.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <p className="text-xs text-[#64748B] mb-1">Thời hạn</p>
                  <p className="font-medium text-white">{product.warranty || "1 tháng"}</p>
                </div>
                <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                  <p className="text-xs text-[#64748B] mb-1">Bảo hành</p>
                  <p className="font-medium text-white">{product.warranty ? "Có bảo hành" : "Không"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policy" className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-6">
              <h3 className="font-sora text-lg font-semibold text-white mb-4">Chính sách bảo hành</h3>
              <div className="space-y-4 text-[#94A3B8]">
                <p>1. Tài khoản được bảo hành trong suốt thời hạn sử dụng.</p>
                <p>2. Nếu tài khoản bị die trong thời gian bảo hành, chúng tôi sẽ đổi tài khoản mới hoặc hoàn tiền.</p>
                <p>3. Không bảo hành trong trường hợp khách hàng tự ý thay đổi mật khẩu hoặc thông tin tài khoản.</p>
                <p>4. Thời gian xử lý bảo hành: 1-24 giờ.</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-6">
              <h3 className="font-sora text-lg font-semibold text-white mb-4">Đánh giá sản phẩm</h3>
              <div className="space-y-4">
                {[
                  { name: "Nguyễn Văn A", rating: 5, comment: "Tài khoản dùng tốt, giao nhanh, sẽ ủng hộ tiếp!", time: "2 ngày trước" },
                  { name: "Trần Thị B", rating: 5, comment: "Mua lần 3 rồi, lần nào cũng okie. Shop uy tín!", time: "5 ngày trước" },
                  { name: "Lê Văn C", rating: 4, comment: "Tài khoản tốt, giao trong vài phút. Nên mua!", time: "1 tuần trước" },
                ].map((review, i) => (
                  <div key={i} className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                          <span className="text-xs font-bold text-white">{review.name[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{review.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn(
                            "h-3 w-3",
                            i < review.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#334155]"
                          )} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#94A3B8]">{review.comment}</p>
                    <p className="text-xs text-[#64748B] mt-2">{review.time}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-6">
              <h3 className="font-sora text-lg font-semibold text-white mb-4">Câu hỏi thường gặp</h3>
              <div className="space-y-4">
                {[
                  { q: "Tài khoản có an toàn không?", a: "Tài khoản của chúng tôi được kiểm tra kỹ trước khi giao. Cam kết 100% account real, không hack." },
                  { q: "Tài khoản có bị ban không?", a: "Tài khoản VIA có xác suất ban thấp. Nếu bị ban trong thời gian bảo hành, chúng tôi sẽ hoàn tiền." },
                  { q: "Thời gian giao tài khoản là bao lâu?", a: "Sau khi thanh toán thành công, tài khoản sẽ được giao trong vài phút (tự động)." },
                  { q: "Có hỗ trợ đổi trả không?", a: "Có. Nếu tài khoản không hoạt động trong thời gian bảo hành, chúng tôi sẽ đổi tài khoản mới hoặc hoàn tiền." },
                ].map((item, i) => (
                  <div key={i} className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4">
                    <p className="font-medium text-white mb-2">{item.q}</p>
                    <p className="text-sm text-[#94A3B8]">{item.a}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
