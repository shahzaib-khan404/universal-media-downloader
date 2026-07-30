const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}/api${path}` : `/api${path}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(url(path), { credentials: 'include' });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
