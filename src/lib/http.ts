import { API_BASE } from './config';
import { getAccessToken, setAccessToken } from './token';

function onRefreshFail() {
  // Clear any access token and force navigation to login
  setAccessToken(null);
  if (typeof window !== 'undefined') window.location.href = '/login';
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Content-Type', 'application/json');
      const newToken = getAccessToken();
      if (newToken) retryHeaders.set('Authorization', `Bearer ${newToken}`);
      const retry = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...options, headers: retryHeaders });
      if (!retry.ok) throw await parseError(retry);
      return retry.json();
    } else {
      onRefreshFail();
      throw { message: 'Session expired. Please log in again.', status: 401 };
    }
  }

  if (!res.ok) throw await parseError(res);
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (!res.ok) return false;
  const data = await res.json();
  setAccessToken(data.accessToken);
  return true;
}

async function parseError(res: Response) {
  const text = await res.text();
  try { return { message: JSON.parse(text).message || res.statusText, status: res.status }; }
  catch { return { message: text || res.statusText, status: res.status }; }
}
