import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (process.client) {
    // Dynamic import for better compatibility
    const Toast = await import('vue-toastification').then(m => m.default || m)
    await import('vue-toastification/dist/index.css')
    
    nuxtApp.vueApp.use(Toast, {
      position: 'top-right',
      timeout: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
      transition: 'Vue-Toastification__bounce',
      maxToasts: 3,
      newestOnTop: true,
    })

    // Get the toast instance directly from Vue app
    const toast = nuxtApp.vueApp.config.globalProperties.$toast
    
    // Provide toast to the app
    nuxtApp.provide('toast', toast)
  }
})
