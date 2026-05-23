"use client";

import { AdminSidebar } from "@/components/shared/admin-sidebar";

interface AdminPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AdminPageLayout({ title, description, children }: AdminPageProps) {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <AdminSidebar />
      <div className="lg:ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-[#64748B]">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
