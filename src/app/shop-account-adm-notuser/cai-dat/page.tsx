"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminSettings, useUpdateSetting } from "@/hooks/useAdmin";

const DEFAULT_SETTINGS = {
  store_name: "ShopAccount",
  store_email: "support@shopaccount.vn",
  store_hotline: "0901 234 567",
  bank_name: "TP Bank",
  bank_bin: "970423",
  bank_account_number: "07553046301",
  bank_account_name: "NGUYEN MINH TUNG",
  bank_qr_image: "",
  momo_account_number: "",
  momo_account_name: "",
  momo_qr_image: "",
  telegram: "",
  zalo: "",
  facebook: "",
  description: "",
  keywords: "",
  facebook_pixel: "",
  google_analytics: "",
};

type SettingKey = keyof typeof DEFAULT_SETTINGS;

export default function AdminSettingsPage() {
  const { data: rawSettings, isLoading } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (rawSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...rawSettings });
    }
  }, [rawSettings]);

  const handleSave = (keys: SettingKey[]) => {
    const saves = keys.map((key) =>
      updateSetting.mutateAsync({ key, value: settings[key] ?? "" })
    );
    Promise.all(saves)
      .then(() => toast.success("Lưu thành công!"))
      .catch(() => toast.error("Lỗi khi lưu"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <AdminSidebar />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <h1 className="font-sora text-xl font-bold text-white">Cài đặt Web</h1>
          <p className="text-sm text-[#64748B]">Cấu hình hệ thống</p>
        </div>
        <div className="p-6 space-y-6 max-w-2xl">
          {/* Thông tin cửa hàng */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Thông tin cửa hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Tên cửa hàng"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              />
              <Input
                label="Email liên hệ"
                type="email"
                value={settings.store_email}
                onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
              />
              <Input
                label="Hotline"
                value={settings.store_hotline}
                onChange={(e) => setSettings({ ...settings, store_hotline: e.target.value })}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["store_name", "store_email", "store_hotline"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin ngân hàng */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Thông tin ngân hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Ngân hàng"
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
              />
              <Input
                label="Mã BIN ngân hàng"
                value={settings.bank_bin}
                onChange={(e) => setSettings({ ...settings, bank_bin: e.target.value })}
                placeholder="970436"
              />
              <p className="text-xs text-[#64748B] -mt-2">
                Tra mã BIN tại: <a href="https://vietqr.net" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">vietqr.net</a>
              </p>
              <Input
                label="Số tài khoản"
                value={settings.bank_account_number}
                onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
              />
              <Input
                label="Tên tài khoản"
                value={settings.bank_account_name}
                onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
              />
              <Input
                label="Link ảnh QR (URL)"
                value={settings.bank_qr_image}
                onChange={(e) => setSettings({ ...settings, bank_qr_image: e.target.value })}
              />
              {settings.bank_qr_image && (
                <div className="mt-2">
                  <img
                    src={settings.bank_qr_image}
                    alt="QR"
                    className="h-40 w-auto rounded-[8px] border border-[#1E293B]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["bank_name", "bank_bin", "bank_account_number", "bank_account_name", "bank_qr_image"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nạp tiền tự động */}
          <Card className="!rounded-[16px] border border-[#22C55E]/30">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Nạp tiền tự động (SePay / Casso)</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-sm text-[#94A3B8]">
              <p>
                Kết nối tài khoản ngân hàng với{" "}
                <a href="https://my.sepay.vn" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">
                  SePay
                </a>{" "}
                hoặc{" "}
                <a href="https://casso.vn" target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">
                  Casso
                </a>{" "}
                để tự động cộng tiền khi khách chuyển khoản.
              </p>
              <div className="rounded-[12px] border border-[#1E293B] bg-[#0F172A] p-4 space-y-2 font-mono text-xs text-[#E2E8F0]">
                <p>
                  <span className="text-[#64748B]">SePay webhook:</span>
                  <br />
                  {typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/sepay` : "https://your-domain.com/api/webhooks/sepay"}
                </p>
                <p>
                  <span className="text-[#64748B]">Casso webhook:</span>
                  <br />
                  {typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/casso` : "https://your-domain.com/api/webhooks/casso"}
                </p>
              </div>
              <ol className="list-decimal list-inside space-y-1">
                <li>SePay: Cấu hình mã thanh toán — Tiền tố <strong className="text-white">NAPTIEN</strong>, hậu tố 10 ký tự chữ/số</li>
                <li>Thêm biến môi trường <code className="text-[#F59E0B]">SEPAY_WEBHOOK_API_KEY</code> (API Key từ SePay)</li>
                <li>Casso: Header <code className="text-[#F59E0B]">secure-token</code> = <code className="text-[#F59E0B]">CASSO_WEBHOOK_SECRET</code></li>
                <li>Chạy <code className="text-[#F59E0B]">npx prisma db push</code> sau khi cập nhật (bảng WebhookLog)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Thông tin MoMo */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Thông tin MoMo</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Số điện thoại MoMo"
                value={settings.momo_account_number}
                onChange={(e) => setSettings({ ...settings, momo_account_number: e.target.value })}
                placeholder="0912 345 678"
              />
              <Input
                label="Tên tài khoản MoMo"
                value={settings.momo_account_name}
                onChange={(e) => setSettings({ ...settings, momo_account_name: e.target.value })}
                placeholder="NGUYEN VAN A"
              />
              <Input
                label="Link ảnh QR MoMo (URL)"
                value={settings.momo_qr_image}
                onChange={(e) => setSettings({ ...settings, momo_qr_image: e.target.value })}
                placeholder="https://..."
              />
              {settings.momo_qr_image && (
                <div className="mt-2">
                  <img
                    src={settings.momo_qr_image}
                    alt="QR MoMo"
                    className="h-40 w-auto rounded-[8px] border border-[#1E293B]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["momo_account_number", "momo_account_name", "momo_qr_image"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Liên kết mạng xã hội */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Liên kết mạng xã hội</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Telegram"
                value={settings.telegram}
                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                placeholder="https://t.me/username"
              />
              <Input
                label="Zalo"
                value={settings.zalo}
                onChange={(e) => setSettings({ ...settings, zalo: e.target.value })}
                placeholder="https://zalo.me/xxx"
              />
              <Input
                label="Facebook"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                placeholder="https://facebook.com/xxx"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["telegram", "zalo", "facebook"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">SEO</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Mô tả website"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              />
              <Input
                label="Keywords (phân cách bằng dấu phẩy)"
                value={settings.keywords}
                onChange={(e) => setSettings({ ...settings, keywords: e.target.value })}
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["description", "keywords"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input
                label="Facebook Pixel ID"
                value={settings.facebook_pixel}
                onChange={(e) => setSettings({ ...settings, facebook_pixel: e.target.value })}
                placeholder="123456789"
              />
              <Input
                label="Google Analytics ID"
                value={settings.google_analytics}
                onChange={(e) => setSettings({ ...settings, google_analytics: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => handleSave(["facebook_pixel", "google_analytics"])}
                  disabled={updateSetting.isPending}
                >
                  {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
