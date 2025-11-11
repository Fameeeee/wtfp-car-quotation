export const useNotification = () => {
  // Access toast instance from Nuxt app context
  const nuxtApp = useNuxtApp() as any
  const toast = nuxtApp.$toast

  // Fallback if toast is not available
  if (!toast) {
    console.warn('Toast plugin not available')
    return {
      success: (message: string) => console.log('SUCCESS:', message),
      error: (message: string) => console.error('ERROR:', message),
      warning: (message: string) => console.warn('WARNING:', message),
      info: (message: string) => console.info('INFO:', message),
      apiError: (error: any, fallback: string) => console.error('API ERROR:', error, fallback),
    }
  }

  return {
    success: (message: string, options: any = {}) => {
      toast.success(message, {
        timeout: 3000,
        ...options,
      })
    },
    
    error: (message: string, options: any = {}) => {
      toast.error(message, {
        timeout: 4000,
        ...options,
      })
    },
    
    warning: (message: string, options: any = {}) => {
      toast.warning(message, {
        timeout: 3500,
        ...options,
      })
    },
    
    info: (message: string, options: any = {}) => {
      toast.info(message, {
        timeout: 3000,
        ...options,
      })
    },

    // Custom method for API errors
    apiError: (error: any, fallbackMessage = 'เกิดข้อผิดพลาด') => {
      const message = error?.response?.data?.message || error?.message || fallbackMessage
      toast.error(message, {
        timeout: 4000,
      })
    },
  }
}
