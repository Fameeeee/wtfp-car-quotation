import { defineNuxtPlugin } from '#app'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  // Install the plugin with options
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

  // Get the toast instance using useToast
  const toast = useToast()
  
  // Provide it to the app
  nuxtApp.provide('toast', toast)
})
