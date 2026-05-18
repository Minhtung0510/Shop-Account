"use client";

import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64">
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-6 py-4 sticky top-0 z-10">
          <h1 className="font-sora text-xl font-bold text-white">Cài đặt</h1>
          <p className="text-sm text-[#64748B]">Cấu hình hệ thống</p>
        </div>
        <div className="p-6 space-y-6 max-w-2xl">
          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Thông tin cửa hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input label="Tên cửa hàng" defaultValue="ShopAccount" />
              <Input label="Email liên hệ" type="email" defaultValue="support@shopaccount.vn" />
              <Input label="Hotline" defaultValue="0901 234 567" />
              <div className="flex justify-end">
                <Button>Lưu thay đổi</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="!rounded-[16px]">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-white">Thông tin ngân hàng</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <Input label="Ngân hàng" defaultValue="Vietcombank" />
              <Input label="Số tài khoản" defaultValue="1234567890" />
              <Input label="Tên tài khoản" defaultValue="SHOP ACCOUNT" />
              <div className="flex justify-end">
                <Button>Lưu thay đổi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
