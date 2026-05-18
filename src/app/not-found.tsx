"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <h1 className="font-sora text-8xl font-bold text-[#1F2937]">404</h1>
      </div>
      <h2 className="font-sora text-2xl font-bold text-white mb-3">
        Trang không tìm thấy
      </h2>
      <p className="text-[#94A3B8] mb-8 max-w-md">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
