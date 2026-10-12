import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/env.js';
import { login, me, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginRules, registerRules } from '../validators/authValidators.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => getConfig().isTest,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, ...validate(registerRules), register);
authRouter.post('/login', authLimiter, ...validate(loginRules), login);
authRouter.get('/me', protect, me);
