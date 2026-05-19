"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MockAuthProvider } from "@/lib/mock-auth";
import { ThemeProvider } from "./theme-provider";
import { useState } from "react";

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
    <ThemeProvider>
      <MockAuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MockAuthProvider>
    </ThemeProvider>
  );
}
