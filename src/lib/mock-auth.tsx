"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MOCK_USERS } from "@/lib/mock-users";

const SESSION_KEY = "shopaccount_session";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  balance: number;
  orders: number;
  rank: string;
  created: string;
}

interface MockSession {
  user: MockUser;
}

interface MockAuthContextType {
  data: MockSession | null;
  status: "authenticated" | "unauthenticated" | "loading";
  update: (data?: Partial<MockUser>) => void;
}

const MockAuthContext = createContext<MockAuthContextType>({
  data: null,
  status: "loading",
  update: () => {},
});

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MockSession | null>(null);
  const [status, setStatus] = useState<"authenticated" | "unauthenticated" | "loading">("loading");

  const readSession = () => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setData({ user });
        setStatus("authenticated");
      } catch {
        setData(null);
        setStatus("unauthenticated");
      }
    } else {
      setData(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    readSession();

    const handleStorage = () => readSession();
    const handleFocus = () => readSession();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const update = (updates?: Partial<MockUser>) => {
    if (data?.user) {
      const updatedUser = { ...data.user, ...updates };
      const newData = { user: updatedUser };
      setData(newData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
  };

  return (
    <MockAuthContext.Provider value={{ data, status, update }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockSession() {
  return useContext(MockAuthContext);
}

export function getMockSession(): MockUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearMockSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}
