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
    ...(opts.headers as Record<string, string>),
  };

  if (!(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    
    let details = body.details;
    let message = body.message;

    // Support FastAPI's "detail" structure
    if (!details && Array.isArray(body.detail)) {
      details = body.detail;
      if (!message) message = 'Errores de validación';
    } else if (!message && typeof body.detail === 'string') {
      message = body.detail;
    }

    throw new ApiError(
      message || 'Error en la solicitud',
      response.status,
      details || undefined,
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

  postForm: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      body: formData,
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
