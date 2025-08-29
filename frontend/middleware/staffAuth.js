import { isStaffOrManager } from '../composables/useAuth'

export default async function ({ to, from }) {
  if (process.client) {
    try {
      const backend = useRuntimeConfig().public.backendUrl || 'http://localhost:3001'
      const res = await fetch(`${backend}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        const role = json?.user?.role
        if (!json?.authenticated || (role !== 'staff' && role !== 'manager')) {
          return navigateTo('/')
        }
        return
      }
    } catch (e) {
      if (!isStaffOrManager()) return navigateTo('/')
    }
  }
}
