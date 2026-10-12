import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: IUser;
    }
  }
}

export {};
