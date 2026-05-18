import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Lazy initialization - don't error at build time if DB not available
let dbInitialized = false;

export async function ensureDbInitialized(): Promise<void> {
  if (dbInitialized) return;
  try {
    await db.$connect();
    dbInitialized = true;
  } catch {
    // Database not available during build - will be available at runtime
  }
}
