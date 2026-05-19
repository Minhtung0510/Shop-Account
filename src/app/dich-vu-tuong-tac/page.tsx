"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";

export default function InteractionServicesPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-1.5 text-sm text-[#3B82F6] mb-4">
            <Sparkles className="h-4 w-4" />
            Dịch vụ Tương tác
          </div>
          <h1 className="font-sora text-3xl lg:text-4xl font-bold text-white mb-2">
            Dịch vụ Tương tác Mạng Xã Hội
          </h1>
          <p className="text-[#94A3B8]">
            Tăng like, follow, view và tương tác trên các nền tảng MXH
          </p>
        </div>

        {/* Coming Soon */}
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#3B82F6]/10">
              <Zap className="h-16 w-16 text-[#3B82F6]" />
            </div>
            <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#3B82F6]">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>

          <h2 className="font-sora text-2xl lg:text-3xl font-bold text-white mb-4 text-center">
            Đang trong quá trình phát triển
          </h2>
          <p className="text-[#94A3B8] text-center max-w-md mb-8">
            Dịch vụ tương tác đang được chúng tôi xây dựng và sẽ sớm ra mắt. Hãy quay lại sau nhé!
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/">
              <Button variant="outline">
                Quay lại trang chủ
              </Button>
            </Link>
            <Link href="/contact">
              <Button>
                Liên hệ hỗ trợ
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
          {[
            { icon: "👍", title: "Tăng Like", desc: "Facebook, Instagram, TikTok" },
            { icon: "👥", title: "Tăng Follower", desc: "Instagram, TikTok, Twitter" },
            { icon: "👁️", title: "Tăng View", desc: "TikTok, YouTube, Facebook" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-[16px] border border-[#1E293B] bg-[#111827] p-6 text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-sora font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-[#64748B]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
