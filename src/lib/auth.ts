import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/env/schema";
import { createAuditLog } from "@/lib/audit";

export const LOGIN_POLICY = {
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 15,
} as const;

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

        if (user.isLocked) {
          if (user.lockUntil && new Date() > user.lockUntil) {
            await db.user.update({
              where: { id: user.id },
              data: {
                isLocked: false,
                lockedAt: null,
                lockUntil: null,
                failedLoginAttempts: 0,
              },
            });
          } else {
            return null;
          }
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          const newAttempts = (user.failedLoginAttempts || 0) + 1;
          const shouldLock = newAttempts >= LOGIN_POLICY.maxFailedAttempts;

          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: newAttempts,
              isLocked: shouldLock,
              lockedAt: shouldLock ? new Date() : null,
              lockUntil: shouldLock
                ? new Date(Date.now() + LOGIN_POLICY.lockoutDurationMinutes * 60 * 1000)
                : null,
            },
          });

          return null;
        }

        if (user.failedLoginAttempts > 0 || user.isLocked) {
          await db.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              isLocked: false,
              lockedAt: null,
              lockUntil: null,
            },
          });
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
      }
      return session;
    },
  },
});

export const isAdmin = (role: string | undefined) => {
  return role === "ADMIN";
};
