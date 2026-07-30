import * as dotenv from 'dotenv';
dotenv.config();

// Validate env vars before anything else boots
import './lib/env';

import { buildApp } from './app';
import { startDirectWorker } from './modules/queue/direct-worker';
import { env } from './lib/env';

async function main() {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`Backend ready on http://0.0.0.0:${env.PORT}`);

  if (process.env.DIRECT_WORKER !== 'false') {
    startDirectWorker();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
