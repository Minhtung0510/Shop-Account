"use client";

import { useMockSession } from "@/lib/mock-auth";

export function useSession() {
  const mock = useMockSession();

  return {
    data: mock.data ? {
      user: {
        id: mock.data.user.id,
        name: mock.data.user.name,
        email: mock.data.user.email,
        role: mock.data.user.role,
        balance: mock.data.user.balance,
        rank: mock.data.user.rank,
        image: undefined as string | undefined,
      },
    } : null,
    status: mock.status,
    update: mock.update,
  };
}

export function signOut() {
  const { clearMockSession } = require("@/lib/mock-auth");
  clearMockSession();
  window.location.href = "/";
}
