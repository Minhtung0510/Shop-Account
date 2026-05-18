"use client";

import * as React from "react";
import { Toaster } from "sonner";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ toast: () => {}, dismiss: () => {} }}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "#111827",
            border: "1px solid #1E293B",
            color: "#FFFFFF",
            borderRadius: "14px",
          },
          className: "font-inter",
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("useToast must be used within a ToastProvider")
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    return {
      toast: () => {},
      dismiss: () => {},
    };
  }
  return context;
}
