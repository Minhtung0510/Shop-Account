"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, X, Folder } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  createdAt: string;
}

function CategoryModal({ category, onClose, onSave }: {
  category?: Category;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({ name: category?.name || "", icon: category?.icon || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vui lòng nhập tên danh mục"); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: category ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Lỗi"); setSaving(false); return; }
      onSave();
      onClose();
    } catch { setError("Lỗi kết nối"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[16px] border border-[#1E293B] bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <h2 className="text-lg font-bold text-white">{category ? "Sửa danh mục" : "Thêm danh mục"}</h2>
          <button onClick={onClose} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-[8px] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tên danh mục *</label>
            <input value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
              placeholder="VD: Tai khoan Netflix" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Icon (emoji)</label>
            <input value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
              placeholder="🎬" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (category ? "Lưu" : "Tạo")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = () => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (cat: Category) => {
    if (cat.productCount > 0) {
      alert(`Danh mục "${cat.name}" đang có ${cat.productCount} sản phẩm. Xóa sản phẩm trước.`);
      return;
    }
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Lỗi"); }
      else { setCategories((prev) => prev.filter((c) => c.id !== cat.id)); }
    } catch { alert("Lỗi kết nối"); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Danh mục</h1>
              <p className="text-sm text-[#64748B]">{categories.length} danh mục</p>
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Thêm danh mục
            </Button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="!rounded-[16px] overflow-hidden border border-[#1E293B]">
                  <div className="p-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B82F6]/20 to-[#06B6D4]/20 text-2xl">
                      {cat.icon || "📁"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{cat.name}</h3>
                      <p className="text-xs text-[#64748B]">{cat.productCount} sản phẩm</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => { setEditing(cat); setShowModal(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                      >
                        {deletingId === cat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Folder className="h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#64748B]">Chưa có danh mục nào</p>
              <Button className="mt-4" size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
                <Plus className="h-4 w-4" /> Thêm danh mục đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CategoryModal
          category={editing || undefined}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={fetchCategories}
        />
      )}
    </div>
  );
}
