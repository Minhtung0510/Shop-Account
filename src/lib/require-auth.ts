import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return { authorized: false, response: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }
  
  return { authorized: true, session };
}

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    return { authorized: false, response: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }
  
  const role = session.user.role as string;
  if (role !== "ADMIN") {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Không đủ quyền truy cập" }, { status: 403 }) 
    };
  }
  
  return { authorized: true, session };
}
