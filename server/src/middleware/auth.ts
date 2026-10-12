import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  let userId = '';
  try {
    const decoded = verifyToken(token);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new Error('Invalid token payload');
    }
    userId = decoded.sub;
  } catch {
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  req.user = user;
  next();
});
