import 'dotenv/config';
import type { Server } from 'node:http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { getConfig } from './config/env.js';
import { logger } from './utils/logger.js';

const config = getConfig();

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('Shutting down', { signal });

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  if (server) {
    await new Promise<void>((resolve) => server?.close(() => resolve()));
  }
  await disconnectDB();
  clearTimeout(forceExit);
  process.exit(0);
}

connectDB()
  .then(() => {
    server = createApp().listen(config.port, () => {
      logger.info('TaskFlow API listening', { port: config.port });
    });
  })
  .catch((error: unknown) => {
    logger.error('Failed to start server', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  });

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
