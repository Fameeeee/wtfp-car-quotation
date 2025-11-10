import { useToast } from 'vue-toastification'

export const useNotification = () => {
  const toast = useToast()

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
