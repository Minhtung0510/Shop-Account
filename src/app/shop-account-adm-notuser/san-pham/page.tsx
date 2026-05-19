"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setProducts(data); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Sản phẩm</h1>
              <p className="text-sm text-[#64748B]">Quản lý sản phẩm trong cửa hàng</p>
            </div>
            <Button size="sm"><Plus className="h-4 w-4" /> Thêm sản phẩm</Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input type="text" placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" /></div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="!rounded-[16px] overflow-hidden">
                  <div className="aspect-square bg-[#1F2937] relative">
                    <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                    {product.badge && (
                      <Badge className="absolute left-2 top-2 text-xs bg-orange-500/80 text-white">
                        {product.badge === "BEST_SELLER" ? "Best" : product.badge === "HOT" ? "Hot" : "Premium"}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{product.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sora font-bold text-[#3B82F6]">{formatCurrency(product.price)}</span>
                      <span className="text-xs text-[#64748B]">Còn: {product.stock}</span>
                    </div>
                    <div className="flex gap-1">
                      <button className="flex-1 flex items-center justify-center gap-1 rounded-[8px] bg-[#3B82F6]/10 py-1.5 text-xs text-[#3B82F6] hover:bg-[#3B82F6]/20"><Eye className="h-3 w-3" /> Xem</button>
                      <button className="flex-1 flex items-center justify-center gap-1 rounded-[8px] bg-[#F59E0B]/10 py-1.5 text-xs text-[#F59E0B] hover:bg-[#F59E0B]/20"><Edit className="h-3 w-3" /> Sửa</button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="flex items-center justify-center py-12 text-[#64748B]">
              {search ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
