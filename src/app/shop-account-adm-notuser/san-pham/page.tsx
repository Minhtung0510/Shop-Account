"use client";

import { useState, useEffect, useRef } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Eye, Loader2, X, Image, KeyRound, Copy, CheckCircle } from "lucide-react";
import { formatCurrency as fmt } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category?: { id: string; name: string };
  thumbnail: string;
  images: string;
  stock: number;
  rating: number;
  sold: number;
  badge?: string;
  status: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ProductModal({ product, categories, onClose, onSave }: {
  product?: Product;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    originalPrice: product?.originalPrice?.toString() || "",
    categoryId: product?.category?.id || "",
    thumbnail: product?.thumbnail || "",
    images: product?.images || "",
    stock: product?.stock?.toString() || "0",
    badge: product?.badge || "",
    status: product?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const price = parseFloat(form.price);
    if (!form.name || !price || !form.categoryId) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price,
          originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
          stock: parseInt(form.stock) || 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Lỗi khi lưu");
        setSaving(false);
        return;
      }

      onSave();
      onClose();
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <h2 className="text-lg font-bold text-white">
            {product ? "Chinh sua san pham" : "Them san pham moi"}
          </h2>
          <button onClick={onClose} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-[8px] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Ten san pham *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="VD: Tai khoan Facebook 500 friends"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Gia (VND) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Gia goc (VND)</label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="75000"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Danh muc *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="">Chon danh muc</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Ton kho</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="">Khong co</option>
                <option value="HOT">HOT</option>
                <option value="BEST_SELLER">Best Seller</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Trang thai</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
              >
                <option value="ACTIVE">Hoat dong</option>
                <option value="INACTIVE">An</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Anh dai dien (URL)</label>
              <input
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="https://..."
              />
              {form.thumbnail && (
                <img src={form.thumbnail} alt="preview" className="mt-2 h-24 rounded-[8px] object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Mo ta</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none resize-none"
                placeholder="Mo ta san pham..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Huy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (product ? "Luu thay doi" : "Tao san pham")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccountInventoryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [accounts, setAccounts] = useState<Array<{ id: string; email: string; password: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const fetchAccounts = () => {
    fetch(`/api/admin/accounts?productId=${product.id}`)
      .then((res) => res.ok ? res.json() : [])
      .then(setAccounts)
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccounts(); }, [product.id]);

  const handleAdd = async () => {
    if (!newEmail || !newPass) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          accounts: [{ email: newEmail, password: newPass }],
        }),
      });
      if (res.ok) {
        setNewEmail("");
        setNewPass("");
        setAddMode(false);
        fetchAccounts();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xoa tai khoan nay?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/accounts?id=${id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const availableCount = accounts.filter((a) => a.status === "AVAILABLE").length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Quan ly tai khoan</h2>
            <p className="text-sm text-[#64748B]">{product.name} — {availableCount} san sang</p>
          </div>
          <button onClick={onClose} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 shrink-0 border-b border-[#1E293B]">
          <div className="flex items-center gap-2 mb-3">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (VD: netflix@test.com)"
              className="flex-1 rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
              disabled={saving}
            />
            <input
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Mat khau"
              className="flex-1 rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
              disabled={saving}
            />
            <Button size="sm" onClick={handleAdd} disabled={saving || !newEmail || !newPass}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Them"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <KeyRound className="h-10 w-10 text-[#334155] mx-auto mb-2" />
              <p className="text-sm text-[#64748B]">Chua co tai khoan nao</p>
              <p className="text-xs text-[#475569] mt-1">Them tai khoan ben tren de ban</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3 rounded-[10px] border border-[#1E293B] bg-[#111827] p-3">
                  <div className={`h-2 w-2 rounded-full shrink-0 ${acc.status === "AVAILABLE" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono truncate">{acc.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#64748B]">Pass:</span>
                      <span className="text-xs text-white font-mono">{showPass ? acc.password : "••••••••"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText(acc.email, `${acc.id}-e`)}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#1E293B] text-[#94A3B8] hover:text-white shrink-0"
                    title="Copy email"
                  >
                    {copiedId === `${acc.id}-e` ? <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => copyText(acc.password, `${acc.id}-p`)}
                    className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#1E293B] text-[#94A3B8] hover:text-white shrink-0"
                    title="Copy password"
                  >
                    {copiedId === `${acc.id}-p` ? <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  {acc.status === "AVAILABLE" ? (
                    <button
                      onClick={() => handleDelete(acc.id)}
                      disabled={deletingId === acc.id}
                      className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 shrink-0"
                      title="Xoa"
                    >
                      {deletingId === acc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  ) : (
                    <span className="text-xs text-[#EF4444] shrink-0">Da ban</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[#1E293B] p-5 shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>Dong</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accountProduct, setAccountProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Khong the tai san pham");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi khi tai du lieu");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()])
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Ban co chan chan muon xoa san pham nay?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Loi khi xoa");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">San pham</h1>
              <p className="text-sm text-[#64748B]">{products.length} san pham</p>
            </div>
            <Button size="sm" onClick={() => { setEditing(undefined!); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Them san pham
            </Button>
          </div>
          <div className="relative mt-3 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Tim kiem san pham..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <Card key={product.id} className="!rounded-[16px] overflow-hidden border border-[#1E293B]">
                  <div className="aspect-square bg-[#1F2937] relative">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Image className="h-10 w-10 text-[#334155]" />
                      </div>
                    )}
                    {product.badge && (
                      <Badge className={`absolute left-2 top-2 text-xs ${
                        product.badge === "BEST_SELLER" ? "bg-orange-500/80 text-white" :
                        product.badge === "HOT" ? "bg-red-500/80 text-white" :
                        "bg-purple-500/80 text-white"
                      }`}>
                        {product.badge === "BEST_SELLER" ? "Best" : product.badge === "HOT" ? "Hot" : "Premium"}
                      </Badge>
                    )}
                    {product.status !== "ACTIVE" && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="rounded-[8px] bg-red-500/80 px-3 py-1 text-xs font-bold text-white">AN</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold text-white line-clamp-1 mb-0.5">{product.name}</h3>
                    <p className="text-xs text-[#64748B] mb-2">{product.category?.name || "Khong phan loai"}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sora font-bold text-[#3B82F6]">{fmt(product.price)}</span>
                      <span className="text-xs text-[#64748B]">Con: {product.stock}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(product); setShowModal(true); }}
                        className="flex items-center justify-center gap-1 rounded-[8px] bg-[#F59E0B]/10 py-1.5 px-2 text-xs text-[#F59E0B] hover:bg-[#F59E0B]/20"
                      >
                        <Edit2 className="h-3 w-3" /> Sua
                      </button>
                      <button
                        onClick={() => setAccountProduct(product)}
                        className="flex items-center justify-center gap-1 rounded-[8px] bg-[#6366F1]/10 py-1.5 px-2 text-xs text-[#6366F1] hover:bg-[#6366F1]/20"
                        title="Quan ly tai khoan"
                      >
                        <KeyRound className="h-3 w-3" /> TK
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Image className="h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#64748B]">
                {search ? "Khong tim thay san pham nao" : "Chua co san pham nao"}
              </p>
              {!search && (
                <Button className="mt-4" size="sm" onClick={() => { setEditing(undefined!); setShowModal(true); }}>
                  <Plus className="h-4 w-4" /> Them san pham dau tien
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editing || undefined}
          categories={categories}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={fetchProducts}
        />
      )}

      {accountProduct && (
        <AccountInventoryModal
          product={accountProduct}
          onClose={() => setAccountProduct(null)}
        />
      )}
    </div>
  );
}
