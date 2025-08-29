export function getToken() {
  // During cookie-based auth, token is httpOnly and not readable from JS.
  // Provide a compatibility fallback that reads localStorage if present.
  if (process.client) {
    return localStorage.getItem('access_token') || null;
  }
  return null;
}

export function parseToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1] || '';
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4 === 2 ? '==' : base64.length % 4 === 3 ? '=' : '';
    const decoded = atob(base64 + pad);
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
}

export function getStaffId() {
  const token = getToken();
  const parsed = parseToken(token);
  return parsed?.id || parsed?.sub || parsed?.staffId || null;
}

export async function getMe() {
  if (!process.client) return null;
  try {
    const backend = useRuntimeConfig().public.backendUrl || 'http://localhost:3001';
    const res = await fetch(`${backend}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch (e) {
    return null;
  }
}

export async function getStaffIdAsync() {
  const me = await getMe();
  return me?.id || me?.staffId || null;
}

export function isManager() {
  const token = getToken();
  const parsed = parseToken(token);
  return parsed?.role === 'manager';
}

export function isStaffOrManager() {
  const token = getToken();
  const parsed = parseToken(token);
  const role = parsed?.role;
  return role === 'staff' || role === 'manager';
}

export function setToken(token) {
  // In cookie-based flow we don't store token in localStorage.
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
    // also inform server to clear cookie
    try {
      const backend = useRuntimeConfig().public.backendUrl || 'http://localhost:3001'
      fetch(`${backend}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      // noop
    }
  }
}
