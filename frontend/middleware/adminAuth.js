import { isManager, getToken } from '../composables/useAuth.ts'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side to avoid hydration mismatch
  if (process.server) {
    return;
  }

  if (process.client) {
    try {
      const token = getToken();
      if (!token) {
        if (!isManager()) return navigateTo('/controller/login');
        return;
      }
      
      // Use the axios instance configured in plugins/axios.js
      const api = useApi();
      const response = await api.get('/auth/me');
      
      // Updated for new response structure
      const user = response.data?.data?.user;
      
      if (!response.data?.data?.authenticated || user?.role !== 'manager') {
        return navigateTo('/controller/login')
      }
      return
    } catch (e) {
      if (!isManager()) return navigateTo('/controller/login')
    }
  }
})
