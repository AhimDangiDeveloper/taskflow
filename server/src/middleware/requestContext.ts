import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { getConfig } from '../config/env.js';
import { logger } from '../utils/logger.js';

const SAFE_REQUEST_ID = /^[A-Za-z0-9_-]{1,80}$/;

export const requestContext: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const requestId = incoming && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const started = Date.now();
  res.on('finish', () => {
    if (getConfig().isTest) return;
    logger.info('request', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });

  next();
};
