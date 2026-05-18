import { cookies } from "next/headers";

const SESSION_COOKIE = "shopaccount_session";

export interface MockUserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  balance: number;
  rank: string;
}

export async function getMockSession(): Promise<MockUserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);
    if (!sessionCookie?.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
