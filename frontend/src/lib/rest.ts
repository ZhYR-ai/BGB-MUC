export function apiBase(): string {
  const base = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  if (base) return base.replace(/\/$/, '');
  const gql = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (gql) return gql.replace(/\/?graphql\/?$/, '');
  return 'http://localhost:4000';
}

export async function postJson<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

