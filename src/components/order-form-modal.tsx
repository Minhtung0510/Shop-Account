"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Phone, MessageSquare, Loader2, LogIn, Wallet, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useUserStore } from "@/store";

interface Service {
  id: string;
  name: string;
  slug: string;
  icon: string;
  price: number;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  rank: string;
  role: string;
}

interface OrderFormModalProps {
  service: Service;
  user: User | null;
  onClose: () => void;
  onRequireLogin: () => void;
  onRequireNapTien: () => void;
}

export function OrderFormModal({ service, user, onClose, onRequireLogin, onRequireNapTien }: OrderFormModalProps) {
  const router = useRouter();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const [formData, setFormData] = useState({
    phone: "",
    telegram: "",
  });
  const [errors, setErrors] = useState<{ phone?: string; telegram?: string }>({});
  const [loading, setLoading] = useState(false);

  const validatePhone = (value: string) => {
    if (!value.trim()) return "Vui lòng nhập số điện thoại";
    const phoneRegex = /^(0[0-9]{9,10})$/;
    if (!phoneRegex.test(value.trim())) return "Số điện thoại không hợp lệ (VD: 0912345678)";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          serviceSlug: service.slug,
          serviceIcon: service.icon,
          servicePrice: service.price,
          serviceDescription: service.description,
          phone: formData.phone.trim(),
          telegram: formData.telegram.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Vui lòng đăng nhập để sử dụng dịch vụ");
          onRequireLogin();
          onClose();
          return;
        }
        if (res.status === 402) {
          toast.error("Số dư không đủ. Vui lòng nạp tiền.");
          onRequireNapTien();
          onClose();
          return;
        }
        throw new Error(data.error || "Đặt dịch vụ thất bại");
      }

      toast.success("Đặt dịch vụ thành công!", {
        description: `Đã thanh toán ${formatCurrency(service.price)}. Chúng tôi sẽ liên hệ bạn qua Zalo.`,
      });
      await fetchUser();
      onClose();
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const insufficientBalance = user ? user.balance < service.price : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-[20px] border border-[#1E293B] bg-[#0F172A] shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
            <h2 className="font-sora text-lg font-bold text-white">Đặt dịch vụ</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#64748B] hover:bg-[#1E293B] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sora font-semibold text-white truncate">{service.name}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-1">{service.description}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-[12px] bg-[#0F172A] px-3 py-2">
                  <span className="text-sm text-[#94A3B8]">Giá dịch vụ</span>
                  <span className="font-sora font-bold text-[#3B82F6]">
                    {formatCurrency(service.price)}
                  </span>
                </div>
                {user && (
                  <div className="flex items-center justify-between rounded-[12px] bg-[#0F172A] px-3 py-2">
                    <span className="text-sm text-[#94A3B8]">Số dư của bạn</span>
                    <span className={`font-sora font-bold ${insufficientBalance ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
                      {formatCurrency(user.balance)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {insufficientBalance && (
              <div className="rounded-[12px] border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-[#EF4444] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#EF4444]">
                  Số dư không đủ. Cần thêm{" "}
                  <span className="font-bold">{formatCurrency(service.price - user!.balance)}</span>{" "}
                  để thanh toán.
                </p>
              </div>
            )}

            <Input
              label="Số điện thoại Zalo (bắt buộc)"
              placeholder="0912345678"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              error={errors.phone}
              leftIcon={<Phone className="h-4 w-4" />}
            />

            <Input
              label="Telegram (không bắt buộc)"
              placeholder="@username hoặc ID Telegram"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || insufficientBalance}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận thanh toán"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
