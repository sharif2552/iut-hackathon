import './env.js';
import { z } from 'zod';

const boolFromString = z
  .enum(['true', 'false', '1', '0'])
  .catch('true')
  .transform((v) => v === 'true' || v === '1');

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().default('file:./local.db'),

  OFFICE_START_HOUR: z.coerce.number().int().min(0).max(23).default(9),
  OFFICE_END_HOUR: z.coerce.number().int().min(1).max(24).default(17),

  SIMULATOR_INTERVAL_MS: z.coerce.number().int().min(1000).default(30000),
  SIMULATOR_AUTOSTART: boolFromString.default('true'),

  HIGH_ROOM_WATT_THRESHOLD: z.coerce.number().int().positive().default(250),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  GROQ_API_KEY_1: z.string().optional().default(''),
  GROQ_API_KEY_2: z.string().optional().default(''),
  GROQ_API_KEY_3: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  GROQ_TIMEOUT_MS: z.coerce.number().int().positive().default(4000),
});

const parsed = configSchema.parse(process.env);

/** Non-empty, trimmed Groq keys only. Empty keys are ignored per spec. */
const groqKeys = [parsed.GROQ_API_KEY_1, parsed.GROQ_API_KEY_2, parsed.GROQ_API_KEY_3]
  .map((k) => k.trim())
  .filter((k) => k.length > 0);

/** Strip the `file:` prefix Drizzle/libsql-style URLs use. */
const sqlitePath = parsed.DATABASE_URL.replace(/^file:/, '');

export const config = {
  ...parsed,
  groqKeys,
  sqlitePath,
  hasGroq: groqKeys.length > 0,
} as const;

export type Config = typeof config;
