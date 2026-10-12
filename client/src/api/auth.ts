import type { AuthPayload, User } from '../types';
import { request } from './client';

export function register(body: { name: string; email: string; password: string }) {
  return request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function me() {
  return request<{ user: User }>('/auth/me');
}
