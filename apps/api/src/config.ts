import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  API_PORT: z.coerce.number().optional(),
  POSTGRES_HOST: z.string().default("127.0.0.1"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default("powderlens"),
  POSTGRES_USER: z.string().default("powderlens"),
  POSTGRES_PASSWORD: z.string().default("change-me"),
  POSTGRES_SCHEMA: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/).default("public"),
  PEER_POSTGRES_HOST: z.string().optional(),
  PEER_POSTGRES_PORT: z.coerce.number().optional(),
  PEER_POSTGRES_DB: z.string().optional(),
  PEER_POSTGRES_USER: z.string().optional(),
  PEER_POSTGRES_PASSWORD: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  NODE_ENV: z.string().default("development"),
  RUNTIME_ORIGIN: z.enum(["vps", "render"]).default("vps"),
  BACKEND_ROLE: z.enum(["primary", "fallback"]).default("primary")
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  API_PORT: parsed.API_PORT ?? parsed.PORT ?? 4010
};
