export function getToken(): string | null {
  if (process.client) {
    return localStorage.getItem('access_token') || null;
  }
  return null;
}

export function parseToken(token: string | null) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1] || '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4 === 2 ? '==' : base64.length % 4 === 3 ? '=' : '';
    const decoded = atob(base64 + pad);
    return JSON.parse(decoded);
  } catch (e) {
    // keep silent — invalid token
    return null;
  }
}

export function getStaffId(): string | number | null {
  const token = getToken();
  const parsed: any = parseToken(token);
  return parsed?.id || parsed?.sub || parsed?.staffId || null;
}

export async function getMe(): Promise<any | null> {
  if (!process.client) return null;
  try {
  const cfg = useRuntimeConfig().public || {};
  const backend = cfg.backendUrl || 'http://localhost:3001';
  const externalApi = cfg.apiUrl || null;
  const token = getToken();
  if (!token) return null;
  // backend endpoints are served under /api
  const res = await fetch(`${backend.replace(/\/$/, '')}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (e) {
    return null;
  }
}

export async function getStaffIdAsync(): Promise<string | number | null> {
  const me = await getMe();
  return me?.id || me?.staffId || null;
}

export function isManager(): boolean {
  const token = getToken();
  const parsed: any = parseToken(token);
  return parsed?.role === 'manager';
}

export function isStaffOrManager(): boolean {
  const token = getToken();
  const parsed: any = parseToken(token);
  const role = parsed?.role;
  return role === 'staff' || role === 'manager';
}

export function setToken(token?: string) {
  if (process.client && token) {
    try {
      localStorage.setItem('access_token', token);
    } catch (e) {
      // noop
    }
  }
}

export function clearToken() {
  if (process.client) {
    try {
      localStorage.removeItem('access_token');
    } catch (e) {
      // noop
    }
  }
}
