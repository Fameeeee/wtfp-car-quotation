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
    const token = getToken();
    if (!token) return null;
    
    // Use the axios instance configured in plugins/axios.js
    const api = useApi();
    const response = await api.get('/auth/me');
    
    // New response structure: { statusCode, message, data: { authenticated, user } }
    return response.data?.data?.user || null;
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
