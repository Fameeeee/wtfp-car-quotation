import { isManager } from '../composables/useAuth'

export default async function ({ to, from }) {
  if (process.client) {
    try {
      const backend = useRuntimeConfig().public.backendUrl || 'http://localhost:3001'
      const res = await fetch(`${backend}/auth/me`, { credentials: 'include' });
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
