export default defineNuxtPlugin({
  name: 'toast',
  enforce: 'pre',
  async setup(nuxtApp) {
    if (process.client) {
      // Dynamic import for better compatibility
      const { default: Toast } = await import('vue-toastification')
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

      // Provide toast after plugin is installed
      return {
        provide: {
          toast: nuxtApp.vueApp.config.globalProperties.$toast
        }
      }
    }
  }
})
