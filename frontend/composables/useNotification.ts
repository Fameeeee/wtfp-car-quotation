export const useNotification = () => {
  // Access toast instance from Nuxt app context
  const nuxtApp = useNuxtApp() as any
  
  // Try to get the toast instance
  const getToast = () => {
    return nuxtApp.$toast || nuxtApp.vueApp?.config?.globalProperties?.$toast
  }

  return {
    success: (message: string, options: any = {}) => {
      const toast = getToast()
      if (toast && typeof toast.success === 'function') {
        toast.success(message, {
          timeout: 3000,
          ...options,
        })
      } else {
        console.log('✅ SUCCESS:', message)
      }
    },
    
    error: (message: string, options: any = {}) => {
      const toast = getToast()
      if (toast && typeof toast.error === 'function') {
        toast.error(message, {
          timeout: 4000,
          ...options,
        })
      } else {
        console.error('❌ ERROR:', message)
      }
    },
    
    warning: (message: string, options: any = {}) => {
      const toast = getToast()
      if (toast && typeof toast.warning === 'function') {
        toast.warning(message, {
          timeout: 3500,
          ...options,
        })
      } else {
        console.warn('⚠️ WARNING:', message)
      }
    },
    
    info: (message: string, options: any = {}) => {
      const toast = getToast()
      if (toast && typeof toast.info === 'function') {
        toast.info(message, {
          timeout: 3000,
          ...options,
        })
      } else {
        console.info('ℹ️ INFO:', message)
      }
    },

    // Custom method for API errors
    apiError: (error: any, fallbackMessage = 'เกิดข้อผิดพลาด') => {
      const toast = getToast()
      const message = error?.response?.data?.message || error?.message || fallbackMessage
      if (toast && typeof toast.error === 'function') {
        toast.error(message, {
          timeout: 4000,
        })
      } else {
        console.error('❌ API ERROR:', message)
      }
    },
  }
}
