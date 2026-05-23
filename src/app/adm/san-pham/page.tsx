"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Package, 
  RefreshCw, 
  CheckCircle, 
  X, 
  Loader2, 
  Edit2, 
  Trash2,
  AlertCircle,
  Image as ImageIcon,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  status: string;
  thumbnail: string;
  images: string;
  category: Category | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    thumbnail: "",
    images: "",
    badge: "",
    status: "ACTIVE",
  });
  const queryClient = useQueryClient();
  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tải sản phẩm");
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || undefined,
        categoryId: data.categoryId,
        thumbnail: data.thumbnail,
        images: data.images,
        badge: data.badge || undefined,
        status: data.status,
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo sản phẩm");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      fetchProducts();
      fetchCategories();
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo sản phẩm");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice || undefined,
        categoryId: data.categoryId,
        thumbnail: data.thumbnail,
        images: data.images,
        badge: data.badge || undefined,
        status: data.status,
      };
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật sản phẩm");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      fetchProducts();
      fetchCategories();
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi cập nhật sản phẩm");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa sản phẩm");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      fetchProducts();
      fetchCategories();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa sản phẩm");
    },
  });

  const manageAccounts = (product: Product) => {
    router.push(`/adm/tai-khoan?product=${product.id}`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      categoryId: "",
      thumbnail: "",
      images: "",
      badge: "",
      status: "ACTIVE",
    });
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      categoryId: product.category?.id || "",
      thumbnail: product.thumbnail || "",
      images: product.images || "",
      badge: (product as any).badge || "",
      status: product.status || "ACTIVE",
    });
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    if (!confirm(`Xóa sản phẩm "${product.name}"? Hành động không thể hoàn tác.`)) return;
    deleteMutation.mutate(product.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Tên sản phẩm không được để trống!");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert("Giá sản phẩm phải lớn hơn 0!");
      return;
    }
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Hoạt động</Badge>;
      case "INACTIVE":
        return <Badge className="bg-red-500/10 text-red-500"><X className="h-3 w-3 mr-1" />Tắt</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">{status}</Badge>;
    }
  };

  const getBadgeLabel = (badge: string) => {
    switch (badge) {
      case "HOT":
        return <Badge className="bg-orange-500/10 text-orange-500">🔥 Hot</Badge>;
      case "BEST_SELLER":
        return <Badge className="bg-red-500/10 text-red-500">🔥 Best</Badge>;
      case "PREMIUM":
        return <Badge className="bg-purple-500/10 text-purple-500">⭐ Premium</Badge>;
      default:
        return null;
    }
  };

  const filtered = products.filter(p => 
    (p.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AdminPageLayout title="Sản phẩm" description="Quản lý sản phẩm">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchProducts(); fetchCategories(); }} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>
          
          {categories.length === 0 && (
            <div className="mt-3 p-3 rounded-[8px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
              ⚠️ Chưa có danh mục nào. Vui lòng <a href="/adm/danh-muc" className="underline">thêm danh mục</a> trước khi thêm sản phẩm.
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-400">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-[#64748B]">
              {search ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào - Bấm 'Thêm sản phẩm' để tạo mới"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <div key={product.id} className="rounded-[12px] bg-[#1E293B] border border-[#334155] hover:border-[#6366F1] transition-colors overflow-hidden">
                  <div className="aspect-square bg-[#0F172A] flex items-center justify-center relative">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-[#334155]" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="h-7 w-7 rounded-[6px] bg-[#0F172A]/80 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6] transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="h-7 w-7 rounded-[6px] bg-[#0F172A]/80 flex items-center justify-center text-[#94A3B8] hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Xóa"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => manageAccounts(product)}
                        className="h-7 w-7 rounded-[6px] bg-[#0F172A]/80 flex items-center justify-center text-[#94A3B8] hover:text-green-400 hover:bg-green-500/20 transition-colors"
                        title="Quản lý TK"
                      >
                        <Key className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {(product as any).badge && (
                      <div className="absolute left-2 top-2">
                        {getBadgeLabel((product as any).badge)}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h3 className="text-white font-medium text-sm line-clamp-2 flex-1">{product.name || "N/A"}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[#6366F1] font-bold">
                        {(product.price || 0).toLocaleString("vi-VN")}đ
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-[#64748B] line-through">
                          {product.originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span>{product.category?.name || "Uncategorized"}</span>
                      <span className="text-[#10B981]">{product.stock || 0} tồn kho</span>
                    </div>
                    <button
                      onClick={() => manageAccounts(product)}
                      className="w-full mt-2 h-8 rounded-[6px] bg-[#10B981]/10 text-[#10B981] text-xs font-medium hover:bg-[#10B981]/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Key className="h-3 w-3" />
                      Thêm data TK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5 sticky top-0 bg-[#0F172A] z-10">
              <h2 className="text-lg font-bold text-white">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingProduct(null); }} 
                className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tên sản phẩm *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="VD: Tài khoản Netflix Premium"
                  required
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-[8px] border border-[#334155] bg-[#1E293B] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none min-h-[80px]"
                  placeholder="Mô tả chi tiết về sản phẩm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Giá (VNĐ) *</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-[#1E293B] border-[#334155] text-white"
                    placeholder="50000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Giá gốc (VNĐ)</label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="bg-[#1E293B] border-[#334155] text-white"
                    placeholder="100000"
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Danh mục *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.productCount || 0} sản phẩm)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Badge</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value="">Không có</option>
                  <option value="HOT">🔥 Hot</option>
                  <option value="BEST_SELLER">🔥 Best Seller</option>
                  <option value="PREMIUM">⭐ Premium</option>
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Ảnh đại diện (URL)</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tất cả ảnh (JSON array)</label>
                <Input
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder='["url1", "url2", "url3"]'
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#1E293B] border border-[#334155] text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Tắt</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setShowModal(false); setEditingProduct(null); }}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingProduct ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm sản phẩm"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
