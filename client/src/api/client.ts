import type { ApiEnvelope } from '../types';
import { ApiError } from '../lib/apiError';
import { clearToken, getToken } from '../lib/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the API is running.', 0);
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    const message = payload?.message || 'Something went wrong';
    const fieldErrors: Record<string, string> = {};
    for (const issue of payload?.errors ?? []) {
      if (issue.path && !fieldErrors[issue.path]) fieldErrors[issue.path] = issue.msg;
    }

    const isAuthAttempt = path === '/auth/login' || path === '/auth/register';
    if (response.status === 401 && token && !isAuthAttempt) {
      clearToken();
      window.dispatchEvent(new Event('taskflow:unauthorized'));
    }

    throw new ApiError(message, response.status, fieldErrors);
  }

  return payload.data;
}
