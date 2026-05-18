import { z } from "zod";

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_FACEBOOK_ID: z.string().optional(),
  AUTH_FACEBOOK_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  // VietQR
  VIETQR_API_KEY: z.string().optional(),
  VIETQR_ACCOUNT_ID: z.string().optional(),

  // Banking Webhook
  BANKING_WEBHOOK_SECRET: z.string().optional(),

  // Optional
  SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let envCache: Env | null = null;

export function validateEnv(): Env {
  if (envCache) return envCache;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Environment validation failed");
  }

  envCache = result.data;
  return envCache;
}

export const env = process.env.NODE_ENV === "test"
  ? ({
      DATABASE_URL: "postgresql://test:test@localhost:5432/shop_account_test",
      AUTH_SECRET: "test-secret-at-least-32-characters-long",
      NODE_ENV: "test",
      APP_URL: "http://localhost:3000",
    } as Env)
  : validateEnv();
