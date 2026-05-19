"use client";

import { Loader2 } from "lucide-react";

export default function NapTienPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-[#94A3B8]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Đang cập nhật...</span>
      </div>
    </div>
  );
}
