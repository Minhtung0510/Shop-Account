"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import { Service } from "@/types";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setServices(data); })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="font-sora text-xl font-bold text-white">Dịch vụ</h1>
            <p className="text-sm text-[#64748B]">Quản lý dịch vụ Facebook</p>
          </div>
          <Button size="sm"><Plus className="h-4 w-4" /> Thêm dịch vụ</Button>
        </div>
        <div className="p-6">
          <Card className="!rounded-[16px] overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" /></div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-[#EF4444]">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1E293B]">
                      {["Tên", "Danh mục", "Giá", "Mô tả", "Thao tác"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-[#1F2937]/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{service.icon}</span>
                            <span className="text-sm font-medium text-white">{service.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#94A3B8]">{service.category}</td>
                        <td className="px-4 py-3 font-sora font-bold text-[#3B82F6]">{formatCurrency(service.price)}</td>
                        <td className="px-4 py-3 text-sm text-[#64748B] max-w-[200px] truncate">{service.description}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#94A3B8] hover:bg-[#1F2937] hover:text-white"><Eye className="h-4 w-4" /></button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#F59E0B] hover:bg-[#F59E0B]/10"><Edit className="h-4 w-4" /></button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#EF4444] hover:bg-[#EF4444]/10"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {services.length === 0 && (
                  <div className="flex items-center justify-center py-12 text-[#64748B]">Chưa có dịch vụ nào</div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
