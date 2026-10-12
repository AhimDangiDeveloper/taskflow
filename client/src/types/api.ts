import type { User } from './user';

export interface ApiIssue {
  msg: string;
  path?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  errors?: ApiIssue[];
  data: T;
}

export interface AuthPayload {
  token: string;
  user: User;
}
