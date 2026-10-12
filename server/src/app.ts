import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { getConfig } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import { authRouter } from './routes/authRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';

export function createApp() {
  const { clientOrigins, isProduction } = getConfig();
  const app = express();

  if (isProduction) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: clientOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    const databaseUp = mongoose.connection.readyState === 1;
    res.status(databaseUp ? 200 : 503).json({
      success: databaseUp,
      data: {
        status: databaseUp ? 'ok' : 'degraded',
        database: databaseUp ? 'up' : 'down',
      },
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/tasks', taskRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
