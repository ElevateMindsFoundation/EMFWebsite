// Minimal fetch-based API client for the Elevate Minds Foundation backend.
//
// - baseURL comes from VITE_API_URL (see frontend/.env.example), falling back
//   to the local dev default so `npm run dev` works out of the box.
// - credentials: 'include' is required so the httpOnly refresh-token cookie
//   set by POST /api/auth/login|signup|refresh is sent back on subsequent
//   requests (the backend's CORS config allows this origin with credentials).
// - The short-lived access token is NOT persisted here — useAuth.ts holds it
//   in memory and passes it in via setAccessToken so every request after
//   login carries an Authorization header automatically.

const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  skipAuthHeader?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuthHeader } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (currentAccessToken && !skipAuthHeader) {
    headers.Authorization = `Bearer ${currentAccessToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // No-content responses (e.g. DELETE, logout) have nothing to parse.
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = (data && typeof data.error === 'string' ? data.error : undefined) ?? res.statusText;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Pick<RequestOptions, 'skipAuthHeader'>) =>
    request<T>(path, { method: 'POST', body, ...opts }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
