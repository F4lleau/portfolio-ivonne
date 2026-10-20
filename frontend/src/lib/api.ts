const base = import.meta.env.VITE_API_URL || '/api';
let csrfToken = '';
let csrfPromise: Promise<unknown> | undefined;
export function apiUrl(path: string) {
  return `${base}${path}`;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (options.method && !['GET', 'HEAD'].includes(options.method) && !csrfToken) {
    csrfPromise ??= api<{ csrfToken: string }>('/auth/session/').finally(() => {
      csrfPromise = undefined;
    });
    await csrfPromise;
  }
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (csrfToken) headers.set('X-CSRFToken', csrfToken);
  const response = await fetch(apiUrl(path), { ...options, headers, credentials: 'include' });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.detail ||
      (data
        ? Object.entries(data)
            .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
            .join(' · ')
        : `HTTP ${response.status}`);
    throw new ApiError(response.status, message);
  }
  if (data?.csrfToken) csrfToken = data.csrfToken;
  return data as T;
}
