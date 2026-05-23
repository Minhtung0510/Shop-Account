"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/shared/admin-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        });
      }
      alert("Lưu thành công!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Lỗi khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageLayout title="Cài đặt Web" description="Cấu hình website">
      <Card className="!rounded-[16px] bg-[#0F172A] border-[#1E293B]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cấu hình
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSettings}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-[#64748B]">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Tên Website</label>
                <Input
                  value={settings.SITE_NAME || ""}
                  onChange={(e) => setSettings({ ...settings, SITE_NAME: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="ShopAccount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Mô tả Website</label>
                <Input
                  value={settings.SITE_DESCRIPTION || ""}
                  onChange={(e) => setSettings({ ...settings, SITE_DESCRIPTION: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="Mô tả website của bạn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Số điện thoại liên hệ</label>
                <Input
                  value={settings.CONTACT_PHONE || ""}
                  onChange={(e) => setSettings({ ...settings, CONTACT_PHONE: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Email liên hệ</label>
                <Input
                  value={settings.CONTACT_EMAIL || ""}
                  onChange={(e) => setSettings({ ...settings, CONTACT_EMAIL: e.target.value })}
                  className="bg-[#1E293B] border-[#334155] text-white"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
}
