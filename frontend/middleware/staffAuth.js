import { getToken, isStaffOrManager } from '../composables/useAuth.ts'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client side to avoid hydration mismatch
  if (process.server) {
    return;
  }

  if (process.client) {
    try {
      const token = getToken();
      if (!token) {
        if (!isStaffOrManager()) return navigateTo('/');
        return;
      }
      
      // Use the axios instance configured in plugins/axios.js
      const api = useApi();
      const response = await api.get('/auth/me');
      
      // Updated for new response structure
      const user = response.data?.data?.user;
      const role = user?.role;
      
      if (!response.data?.data?.authenticated || (role !== 'staff' && role !== 'manager')) {
        return navigateTo('/')
      }
      return
    } catch (e) {
      if (!isStaffOrManager()) return navigateTo('/')
    }
  }
})
