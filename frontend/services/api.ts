const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}/api${path}` : `/api${path}`;
}

// Tells ngrok to skip its browser-warning interstitial for API fetch calls
const BASE_HEADERS: HeadersInit = {
  'ngrok-skip-browser-warning': 'true',
};

async function throwWithBody(res: Response, method: string, path: string): Promise<never> {
  let reason = '';
  try {
    const body = await res.json() as { message?: string; error?: string };
    reason = body.message ?? body.error ?? '';
  } catch { /* body was not JSON */ }
  throw new Error(reason || `${method} ${path} failed: ${res.status}`);
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    credentials: 'include',
    headers: BASE_HEADERS,
  });
  if (!res.ok) await throwWithBody(res, 'GET', path);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) await throwWithBody(res, 'POST', path);
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    method: 'DELETE',
    credentials: 'include',
    headers: BASE_HEADERS,
  });
  if (!res.ok) await throwWithBody(res, 'DELETE', path);
  return res.json() as Promise<T>;
}
