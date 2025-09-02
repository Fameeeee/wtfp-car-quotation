import axios from "axios";
import { getToken, clearToken } from "~/composables/useAuth";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const backend = config.public.backendUrl || "http://localhost:3001";
  // Support an additional external API (third-party) via API_URL runtime config
  const externalApi = config.public.apiUrl || null;
  // Backend API endpoints are served under the global prefix '/api'
  const base = backend.endsWith("/") ? `${backend}api` : `${backend}/api`;
  const instance = axios.create({
    baseURL: base,
  });

  // create an axios instance for the external API if configured
  let externalInstance = null;
  if (externalApi) {
    try {
      externalInstance = axios.create({ baseURL: externalApi });
    } catch (e) {
      externalInstance = null;
    }
  }

  instance.interceptors.request.use((config) => {
    // attach bearer token from localStorage
    try {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // noop
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err?.response?.status === 401) {
        clearToken();
        if (process.client) {
          try {
            window.location.href = "/controller/login";
          } catch (e) {
            // noop
          }
        }
      }
      return Promise.reject(err);
    }
  );

  return {
    provide: {
      api: instance,
      externalApi: externalApi,
      externalApiClient: externalInstance,
    },
  };
});
