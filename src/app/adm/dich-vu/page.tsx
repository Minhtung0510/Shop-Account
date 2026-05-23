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
  RefreshCw, 
  Headphones,
  X,
  Loader2,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  price: number;
  status: string;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "ACTIVE",
  });
  const queryClient = useQueryClient();

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tải dịch vụ");
      }
      const data = await res.json();
      setServices(Array.isArray(data) ? data : (data.services || []));
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError(err instanceof Error ? err.message : "Lỗi khi tải dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể tạo dịch vụ");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      fetchServices();
      setShowModal(false);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi tạo dịch vụ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật dịch vụ");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      fetchServices();
      setShowModal(false);
      setEditingService(null);
      resetForm();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi cập nhật dịch vụ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể xóa dịch vụ");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      fetchServices();
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa dịch vụ");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      status: "ACTIVE",
    });
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || "",
      description: service.description || "",
      price: service.price?.toString() || "",
      category: service.category || "",
      status: service.status || "ACTIVE",
    });
    setShowModal(true);
  };

  const handleDelete = (service: Service) => {
    if (!confirm(`Xóa dịch vụ "${service.name}"? Hành động không thể hoàn tác.`)) return;
    deleteMutation.mutate(service.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filtered = services.filter(s => 
    (s.name?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <AdminPageLayout title="Dịch vụ" description="Quản lý dịch vụ">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1E293B] border-[#334155] text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchServices} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm dịch vụ
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
              {search ? "Không tìm thấy dịch vụ nào" : "Chưa có dịch vụ nào"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((service) => (
                <div key={service.id} className="p-4 rounded-[12px] bg-[#1E293B] border border-[#334155] hover:border-[#6366F1] transition-colors relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-[12px] bg-[#6366F1]/10 flex items-center justify-center">
                      <Headphones className="h-6 w-6 text-[#6366F1]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-lg font-bold text-[#6366F1]">
                        {service.price?.toLocaleString("vi-VN") || 0}đ
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#3B82F6]/20 transition-colors"
                        title="Sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="h-8 w-8 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Xóa"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={service.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                      {service.status === "ACTIVE" ? "Hoạt động" : "Tắt"}
                    </Badge>
                    {service.category && (
                      <span className="text-xs text-[#64748B]">{service.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[16px] border border-[#1E293B] bg-[#0F172A] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E293B] p-5 sticky top-0 bg-[#0F172A] z-10">
              <h2 className="text-lg font-bold text-white">
                {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingService(null); }} 
                className="rounded-[8px] p-1 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Tên dịch vụ *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="Nhập tên dịch vụ"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-[8px] border border-[#334155] bg-[#1E293B] px-3 py-2.5 text-sm text-white focus:border-[#3B82F6] focus:outline-none min-h-[80px]"
                  placeholder="Mô tả dịch vụ"
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
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#64748B]">Danh mục</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-[#1E293B] border-[#334155] text-white"
                    placeholder="VD: Hosting, Domain"
                  />
                </div>
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
                  onClick={() => { setShowModal(false); setEditingService(null); }}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingService ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm dịch vụ"
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
