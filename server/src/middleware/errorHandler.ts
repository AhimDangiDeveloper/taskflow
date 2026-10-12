import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

function fail(res: Parameters<ErrorRequestHandler>[2], status: number, message: string, requestId?: string, errors?: unknown) {
  res.status(status).json({
    success: false,
    message,
    ...(requestId ? { requestId } : {}),
    ...(errors ? { errors } : {}),
  });
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { requestId, status: err.statusCode });
    }
    fail(res, err.statusCode, err.message, requestId, err.details);
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((issue) => ({
      msg: issue.message,
      path: issue.path,
    }));
    fail(res, 400, 'Please check the highlighted fields', requestId, errors);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    fail(res, 404, 'Resource not found', requestId);
    return;
  }

  if (isDuplicateKey(err)) {
    fail(res, 409, 'An account with this email already exists', requestId);
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    fail(res, 400, 'Invalid JSON body', requestId);
    return;
  }

  logger.error('Unhandled error', {
    requestId,
    name: err instanceof Error ? err.name : 'Error',
    message: err instanceof Error ? err.message : 'Unknown error',
  });
  fail(res, 500, 'Something went wrong', requestId);
};

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
};

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 11000;
}
