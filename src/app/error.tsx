"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-6 text-[#EF4444]">
        <AlertCircle className="h-16 w-16" />
      </div>
      <h2 className="font-sora text-2xl font-bold text-white mb-3">
        Đã xảy ra lỗi
      </h2>
      <p className="text-[#94A3B8] mb-8 max-w-md">
        {error.message || "Có lỗi không mong muốn xảy ra. Vui lòng thử lại."}
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
