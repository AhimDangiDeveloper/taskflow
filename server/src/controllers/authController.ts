import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/http.js';
import { toPublicUser } from '../utils/presenters.js';
import { signToken } from '../utils/token.js';

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('timing-safe-placeholder', 12);

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());
  sendData(res, { token, user: toPublicUser(user) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email }).select('+password');
  const hash = user?.password || DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, hash);

  if (!user?.password || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user._id.toString());
  sendData(res, { token, user: toPublicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  sendData(res, { user: toPublicUser(req.user) });
});
