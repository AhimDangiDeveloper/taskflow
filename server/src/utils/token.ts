import jwt from 'jsonwebtoken';
import { getConfig } from '../config/env.js';

export function signToken(userId: string) {
  const { jwtSecret, jwtExpiresIn } = getConfig();
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getConfig().jwtSecret);
}
