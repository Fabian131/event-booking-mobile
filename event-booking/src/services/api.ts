import { API_BASE_URL } from '@/src/config/api';
import { ApiError } from '@/src/types/auth';
import { storage } from './storage';

let authToken: string | null = null;

export async function setToken(token: string | null): Promise<void> {
  authToken = token;
  if (token) {
    await storage.set('auth_token', token);
  } else {
    await storage.remove('auth_token');
  }
}

export async function getToken(): Promise<string | null> {
  if (authToken) return authToken;
  const stored = await storage.get('auth_token');
  if (stored) authToken = stored;
  return stored;
}

async function request<T>(endpoint: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.message || 'Error en la solicitud',
      response.status,
      body.details || undefined,
    );
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
