import type { RequestHandler } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { AppError, type FieldIssue } from '../utils/AppError.js';

export function validate(chains: ValidationChain[]): RequestHandler[] {
  const check: RequestHandler = (req, _res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      next();
      return;
    }

    const details: FieldIssue[] = result.array().map((issue) => ({
      msg: issue.msg,
      path: 'path' in issue && typeof issue.path === 'string' ? issue.path : undefined,
    }));

    next(new AppError('Please check the highlighted fields', 400, details));
  };

  return [...chains, check];
}
