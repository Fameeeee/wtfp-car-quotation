import { isManager, getToken } from '../composables/useAuth'

export default async function ({ to, from }) {
  if (process.client) {
    try {
      const backend = useRuntimeConfig().public.backendUrl || 'http://localhost:3001'
      const token = getToken();
      if (!token) {
        if (!isManager()) return navigateTo('/controller/login');
        return;
      }
      const res = await fetch(`${backend}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        if (!json?.authenticated || json?.user?.role !== 'manager') {
          return navigateTo('/controller/login')
        }
        return
      }
    } catch (e) {
      // fallback to client-side check
      if (!isManager()) return navigateTo('/controller/login')
    }
  }
}
