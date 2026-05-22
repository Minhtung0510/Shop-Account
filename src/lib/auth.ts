import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/env/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID ?? "",
      clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Facebook({
      clientId: env.AUTH_FACEBOOK_ID ?? "",
      clientSecret: env.AUTH_FACEBOOK_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        if (user.isLocked) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, balance: true, rank: true, isLocked: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.balance = dbUser.balance;
          token.rank = dbUser.rank;
          token.isLocked = dbUser.isLocked;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.balance = token.balance as number;
        session.user.rank = token.rank as string;
        (session.user as any).isLocked = token.isLocked as boolean;
      }
      return session;
    },
  },
});

export const ROLE_LEVELS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MODERATOR: 3,
  STAFF: 4,
  USER: 5,
};

export const ROUTE_REQUIREMENTS: Record<string, { minLevel: number }> = {
  "/adm": { minLevel: 4 },
  "/adm/san-pham": { minLevel: 2 },
  "/adm/danh-muc": { minLevel: 2 },
  "/adm/don-hang": { minLevel: 3 },
  "/adm/bao-hanh": { minLevel: 3 },
  "/adm/dich-vu": { minLevel: 2 },
  "/adm/nguoi-dung": { minLevel: 2 },
  "/adm/nap-tien": { minLevel: 2 },
  "/adm/cai-dat": { minLevel: 2 },
  "/adm/roles": { minLevel: 1 },
  "/adm/nhat-ky": { minLevel: 2 },
};
