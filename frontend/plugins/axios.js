import axios from 'axios'
import { getToken, clearToken } from '../composables/useAuth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const backend = config.public.backendUrl || 'http://localhost:3001'
  const instance = axios.create({
    baseURL: backend,
  })

  instance.interceptors.request.use((config) => {
    // attach bearer token from localStorage
    try {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      // noop
    }
    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401) {
        clearToken()
        if (process.client) {
          try {
            window.location.href = '/controller/login'
          } catch (e) {
            // noop
          }
        }
      }
      return Promise.reject(err)
    }
  )

  return {
    provide: {
      axios: instance,
    },
  }
})
