"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

function LockedAccountModal() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const user = session?.user as any;

  useEffect(() => {
    if (user?.isLocked) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [user?.isLocked]);

  if (!visible || !user?.isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0F172A]/95 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-[20px] border border-[#1E293B] bg-[#111827] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]/20">
          <svg className="h-8 w-8 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6V9a4 4 0 10-8 0v2m-2 0h12a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z" />
          </svg>
        </div>
        <h2 className="font-sora text-xl font-bold text-white mb-2">
          Tài khoản đã bị khoá
        </h2>
        <p className="text-sm text-[#94A3B8] mb-2">
          Tài khoản của bạn hiện tại đã bị khoá và không thể sử dụng.
        </p>
        <p className="text-xs text-[#64748B] mb-7">
          Vui lòng liên hệ <span className="text-[#3B82F6]">admin</span> để được hỗ trợ mở khoá.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-[12px] bg-[#EF4444] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626]"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <LockedAccountModal />
      </QueryClientProvider>
    </SessionProvider>
  );
}
