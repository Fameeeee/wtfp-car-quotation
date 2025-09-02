import type { AxiosInstance } from 'axios'

export function useApi(): AxiosInstance {
  // useNuxtApp().$api is injected by plugins/axios.js
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return useNuxtApp().$api as AxiosInstance
}
