"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  LayoutGrid, 
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
  });
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tải danh mục");
      }
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo danh mục");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      fetchCategories();
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo danh mục");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật danh mục");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      fetchCategories();
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi cập nhật danh mục");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa danh mục");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      fetchCategories();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa danh mục");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", icon: "" });
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      icon: cat.icon || "",
    });
    setShowModal(true);
  };

  const handleDelete = (cat: Category) => {
    if (cat.productCount > 0) {
      alert(`Danh mục "${cat.name}" có ${cat.productCount} sản phẩm. Không thể xóa!`);
      return;
    }
    if (!confirm(`Xóa danh mục "${cat.name}"? Hành động không thể hoàn tác.`)) return;
    deleteMutation.mutate(cat.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = categories.filter(c => 
    (c.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AdminPageLayout title="Danh mục" description="Quản lý danh mục sản phẩm">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchCategories} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm danh mục
              </Button>
            </div>
          </div>
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
              {search ? "Không tìm thấy danh mục nào" : "Chưa có danh mục nào"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((cat) => (
                <div key={cat.id} className="p-4 rounded-[12px] bg-[#1E293B] border border-[#334155] hover:border-[#6366F1] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[10px] bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid className="h-5 w-5 text-[#6366F1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{cat.name}</h3>
                      <p className="text-xs text-[#64748B]">{cat.productCount} sản phẩm</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/20 transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Xóa"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[16px] border border-[#1E293B] bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
              <h2 className="text-lg font-bold text-white">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingCategory(null); }} 
                className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tên danh mục *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="VD: Game Account, Software"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Icon (class name)</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="VD: Gamepad, Code"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setShowModal(false); setEditingCategory(null); }}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingCategory ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm danh mục"
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
