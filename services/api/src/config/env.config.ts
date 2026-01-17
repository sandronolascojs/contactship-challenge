import { z } from 'zod';

const envSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173')
    .transform((val) => val.split(',')),
  RATE_LIMIT_TTL: z
    .string()
    .default('60000')
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z
    .string()
    .default('100')
    .transform((val) => parseInt(val, 10)),
  OPENAI_API_KEY: z.string(),
});

type EnvSchema = z.infer<typeof envSchema>;

export const validateEnv = (): EnvSchema => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Invalid environment variables: ${errors}`);
  }

  return result.data;
};

export const loadEnv = (): EnvSchema => {
  const env = validateEnv();
  Object.assign(process.env, env);
  return env;
};
