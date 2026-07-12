import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  CORS_ORIGIN: z.string().default('*'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  BATCH_SIZE: z.string().default('20').transform((val) => parseInt(val, 10)),
  CONCURRENCY_CAP: z.string().default('3').transform((val) => parseInt(val, 10)),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
