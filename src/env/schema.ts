import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),

  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_FACEBOOK_ID: z.string().optional(),
  AUTH_FACEBOOK_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().default("http://localhost:3000"),

  VIETQR_API_KEY: z.string().optional(),
  VIETQR_ACCOUNT_ID: z.string().optional(),

  BANKING_WEBHOOK_SECRET: z.string().optional(),
  SEPAY_WEBHOOK_API_KEY: z.string().optional(),
  CASSO_WEBHOOK_SECRET: z.string().optional(),

  ADMIN_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  SENTRY_DSN: z.string().optional(),
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
      DATABASE_URL: "sqlserver://test:test@localhost:1433/shop_account_test?encrypt=true&trustServerCertificate=true",
      AUTH_SECRET: "test-secret-at-least-32-characters-long-here",
      NODE_ENV: "test",
      APP_URL: "http://localhost:3000",
    } as Env)
  : validateEnv();
