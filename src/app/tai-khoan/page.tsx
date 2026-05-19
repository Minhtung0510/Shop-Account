"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingCart,
  Grid3X3,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCategories } from "@/hooks/useData";
import type { Product, Category } from "@/types";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_low", label: "Giá thấp đến cao" },
  { value: "price_high", label: "Giá cao đến thấp" },
  { value: "best_selling", label: "Bán chạy nhất" },
];

const priceRanges = [
  { value: "all", label: "Tất cả" },
  { value: "0-50000", label: "Dưới 50K" },
  { value: "50000-100000", label: "50K - 100K" },
  { value: "100000-200000", label: "100K - 200K" },
  { value: "200000-500000", label: "200K - 500K" },
  { value: "500000+", label: "Trên 500K" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState("all");
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { data: categoriesData } = useCategories();
  const { data, isLoading, refetch } = useProducts({
    category: category !== "all" ? category : undefined,
    search: search || undefined,
    sort,
    pageSize: 20,
  });

  const products = data?.items || [];
  const serverCategories = data?.categories || categoriesData || [];

  const handleSearch = () => setSearch(searchInput);

  const filteredProducts = products
    .filter((p) => {
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        if (priceRange.endsWith("+")) {
          if (p.price < Number(priceRange.replace("+", ""))) return false;
        } else if (p.price < min || p.price > max) return false;
      }
      return true;
    });

  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`, {
      description: `${formatCurrency(product.price)}`,
      action: {
        label: "Xem giỏ hàng",
        onClick: () => window.location.href = "/gio-hang",
      },
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            className="w-full h-11 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </Button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-[12px] border border-[#1E293B] bg-[#111827] px-3 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="hidden lg:flex items-center border border-[#1E293B] rounded-[12px] overflow-hidden">
            <button
              onClick={() => setGridSize(2)}
              className={cn("p-2.5 transition-colors", gridSize === 2 ? "bg-[#1F2937] text-white" : "text-[#64748B] hover:text-white")}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGridSize(3)}
              className={cn("p-2.5 transition-colors", gridSize === 3 ? "bg-[#1F2937] text-white" : "text-[#64748B] hover:text-white")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className={cn("w-64 flex-shrink-0 space-y-4", showFilters ? "block" : "hidden sm:block")}>
          <Card className="!rounded-[16px]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Danh mục</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              <button
                onClick={() => setCategory("all")}
                className={cn("w-full text-left px-3 py-2 rounded-[10px] text-sm transition-colors", category === "all" ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white")}
              >
                Tất cả
              </button>
              {serverCategories.map((cat) => (
                <button
                  key={cat.slug || cat.id}
                  onClick={() => setCategory(cat.slug || cat.id)}
                  className={cn("w-full text-left px-3 py-2 rounded-[10px] text-sm transition-colors flex items-center justify-between", category === (cat.slug || cat.id) ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white")}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-60">{cat.productCount ?? (cat as any).count ?? 0}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="!rounded-[16px]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Khoảng giá</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-1">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(range.value)}
                  className={cn("w-full text-left px-3 py-2 rounded-[10px] text-sm transition-colors", priceRange === range.value ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#94A3B8] hover:bg-[#1F2937] hover:text-white")}
                >
                  {range.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <button
            onClick={() => { setCategory("all"); setPriceRange("all"); setSearch(""); setSearchInput(""); setSort("newest"); }}
            className="w-full text-sm text-[#94A3B8] hover:text-white transition-colors py-2"
          >
            Xóa bộ lọc
          </button>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-[18px] border border-[#1E293B] bg-[#111827] overflow-hidden">
                  <Skeleton className="aspect-square rounded-t-[18px]" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#64748B]">{filteredProducts.length} sản phẩm</p>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
                >
                  <Loader2 className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
              </div>
              <div className={cn("grid gap-4 lg:gap-6", gridSize === 2 && "grid-cols-1 sm:grid-cols-2", gridSize === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", gridSize === 4 && "grid-cols-2 lg:grid-cols-4")}>
                {filteredProducts.map((product) => (
                  <Card key={product.id} hover glow className="group overflow-hidden">
                    <Link href={`/tai-khoan/${product.slug || product.id}`}>
                      <div className="relative">
                        <div className="aspect-square overflow-hidden rounded-t-[18px] bg-[#1F2937]">
                          <img
                            src={(product as any).thumbnail || (product as any).images?.[0] || "/placeholder.jpg"}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        {(product as any).badge && (
                          <Badge
                            variant={((product as any).badge === "BEST_SELLER" ? "orange" : (product as any).badge === "HOT" ? "error" : "purple")}
                            className="absolute left-3 top-3"
                          >
                            {((product as any).badge === "BEST_SELLER" ? "🔥 Best" : (product as any).badge === "HOT" ? "🔥 Hot" : "⭐ Premium")}
                          </Badge>
                        )}
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1">
                          <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-xs font-medium text-white">{(product as any).rating || "4.8"}</span>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-sora text-sm font-semibold text-white line-clamp-1">{product.name}</h3>
                          <p className="text-xs text-[#64748B]">{product.category?.name || (product as any).categoryName || ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-sora text-base font-bold text-[#3B82F6]">{formatCurrency(product.price)}</p>
                          {product.originalPrice > 0 && product.originalPrice !== product.price && (
                            <p className="text-xs text-[#64748B] line-through">{formatCurrency(product.originalPrice)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#94A3B8]">Còn {product.stock}</span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#3B82F6]/10 text-[#3B82F6] transition-all hover:bg-[#3B82F6] hover:text-white"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="text-[#64748B] mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[#94A3B8] mb-2">Không tìm thấy sản phẩm nào</p>
                  <p className="text-sm text-[#64748B]">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-[18px] border border-[#1E293B] bg-[#111827] overflow-hidden">
          <Skeleton className="aspect-square rounded-t-[18px]" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-8">
          <h1 className="font-sora text-3xl font-bold text-white mb-2">Danh sách sản phẩm</h1>
          <p className="text-[#94A3B8]">Khám phá và mua tài khoản chất lượng cao</p>
        </div>
        <Suspense fallback={<ProductsLoading />}>
          <ProductsContent />
        </Suspense>
      </div>
    </div>
  );
}
