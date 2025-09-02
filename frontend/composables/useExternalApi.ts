import type { AxiosInstance } from 'axios'

export function useExternalApi(): AxiosInstance | null {
  const nuxt = useNuxtApp()
  // provided in plugins/axios.js as externalApiClient
  return (nuxt && (nuxt.$externalApiClient as AxiosInstance)) || null
}
