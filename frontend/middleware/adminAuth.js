export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || (role !== "manager")) {
      return navigateTo("/controller/login");
    }
  }
});
