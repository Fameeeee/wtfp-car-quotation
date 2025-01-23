export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')); 

    if (!token) {
      return navigateTo('/');
    }

    if (to.path.startsWith('/controller/') && user?.role !== 'admin') {
      return navigateTo('/');
    }

    if (to.path.startsWith('/') && !['staff', 'manager'].includes(user?.role)) {
      return navigateTo('/');
    }
  }
});
