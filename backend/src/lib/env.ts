import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DIRECT_WORKER: z.string().optional(),
  DOWNLOAD_DIR: z.string().min(1).default('/tmp/downloads'),
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2', 'b2']).default('local'),
  ALLOWED_ORIGINS: z.string().optional(),
  // S3/R2/B2 (optional — only required when STORAGE_PROVIDER !== 'local')
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_KEY_ID: z.string().optional(),
  S3_SECRET: z.string().optional(),
  S3_PUBLIC_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`\n[env] Invalid environment variables:\n${issues}\n`);
  if (process.env.NODE_ENV !== 'test') process.exit(1);
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof schema>);
