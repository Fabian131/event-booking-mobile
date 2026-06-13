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

function parseApiError(body: Record<string, unknown>, fallbackMessage: string): { message: string; details?: unknown } {
  let details = body.details;
  let message = body.message as string | undefined;

  if (!details && Array.isArray(body.detail)) {
    details = body.detail;
    if (!message) {
      message = body.detail.length === 1 && body.detail[0].message
        ? body.detail[0].message
        : fallbackMessage;
    }
  } else if (!message && typeof body.detail === 'string') {
    message = body.detail;
  }

  return { message: message || 'Error en la solicitud', details: details || undefined };
}

async function buildHeaders(opts: RequestInit): Promise<HeadersInit> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };
  if (opts.body != null && !(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

interface RequestOptions extends RequestInit {
  noContent?: boolean;
}

async function request<T>(endpoint: string, opts: RequestOptions = {}): Promise<T> {
  const { noContent, ...fetchOpts } = opts;

  const headers = await buildHeaders(fetchOpts);
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOpts,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, details } = parseApiError(body, 'Errores de validación');
    throw new ApiError(message, response.status, details);
  }

  if (noContent && response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

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

  putForm: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'PUT',
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
    request<T>(endpoint, { method: 'DELETE', noContent: true }),
};
