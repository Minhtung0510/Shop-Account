"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Loader2, X, Zap } from "lucide-react";

interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  price: number;
  category: string;
  status: string;
  createdAt: string;
}

function ServiceModal({ service, onClose, onSave }: {
  service?: Service;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: service?.name || "",
    icon: service?.icon || "",
    description: service?.description || "",
    price: service?.price?.toString() || "",
    category: service?.category || "",
    status: service?.status || "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const price = parseFloat(form.price);
    if (!form.name || !price || !form.category) {
      setError("Vui lòng điền đầy đủ thông tin");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/services", {
        method: service ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Lỗi");
      } else {
        onSave();
        onClose();
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <h2 className="text-lg font-bold text-white">
            {service ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </h2>
          <button onClick={onClose} className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-[8px] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tên dịch vụ *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="VD: Tăng Followers" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Icon (emoji)</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
                placeholder="👥" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Giá (VND) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="50000" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Danh mục *</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                placeholder="VD: Facebook" />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Mô tả</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none resize-none"
                placeholder="Mô tả dịch vụ..." />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Trạng thái</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-[8px] border border-[#1E293B] bg-[#111827] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none">
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ẩn</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (service ? "Lưu thay đổi" : "Tạo dịch vụ")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = () => {
    fetch("/api/admin/services")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then(setServices)
      .catch(() => setError("Không thể tải dịch vụ"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Lỗi khi xóa");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sora text-xl font-bold text-white">Dịch vụ MXH</h1>
              <p className="text-sm text-[#64748B]">{services.length} dịch vụ</p>
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
              <Plus className="h-4 w-4" /> Thêm dịch vụ
            </Button>
          </div>
          <div className="relative mt-3 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <input type="text" placeholder="Tìm kiếm dịch vụ..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[12px] border border-[#1E293B] bg-[#111827] text-white text-sm placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none" />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" /></div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((service) => (
                <Card key={service.id} className="!rounded-[16px] overflow-hidden border border-[#1E293B]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <span className="text-2xl">{service.icon || "?"}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditing(service); setShowModal(true); }}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deletingId === service.id}
                          className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          {deletingId === service.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{service.name}</h3>
                    <p className="text-xs text-[#64748B] mb-3">{service.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-sora font-bold text-[#3B82F6]">{formatCurrency(service.price)}</span>
                      <span className={`rounded-[6px] px-2 py-0.5 text-[10px] font-bold ${
                        service.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {service.status === "ACTIVE" ? "Hoat dong" : "An"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Zap className="h-12 w-12 text-[#334155] mb-3" />
              <p className="text-[#64748B]">
                {search ? "Không tìm thấy dịch vụ nào" : "Chưa có dịch vụ nào"}
              </p>
              {!search && (
                <Button className="mt-4" size="sm" onClick={() => { setEditing(null); setShowModal(true); }}>
                  <Plus className="h-4 w-4" /> Thêm dịch vụ đầu tiên
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ServiceModal
          service={editing || undefined}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={fetchServices}
        />
      )}
    </div>
  );
}
