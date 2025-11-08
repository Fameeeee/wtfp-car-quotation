import axios from "axios";
import { getToken, clearToken } from "~/composables/useAuth.ts";

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
    (res) => {
      // Auto-unwrap standardized API responses
      // Backend returns: { statusCode, message, data, timestamp }
      // We want to make response.data = the actual data
      if (res.data && typeof res.data === 'object' && 'statusCode' in res.data && 'data' in res.data) {
        // Keep the original structure but add a convenience property
        res.data._original = { ...res.data };
        // For backwards compatibility, keep the wrapped structure
        // Frontend can access either response.data.data or response.data
      }
      return res;
    },
    (err) => {
      if (err?.response?.status === 401) {
        // Do not force-redirect on explicit login failures; let the page show its error
        const url = err?.config?.url || "";
        const isLoginAttempt = /\/auth\/login\b/.test(url);
        clearToken();
        if (process.client && !isLoginAttempt) {
          try {
            const path =
              (typeof window !== "undefined"
                ? window.location.pathname
                : "/") || "/";
            // If user is on admin area, send to admin login; otherwise send to user login
            if (path.startsWith("/controller")) {
              window.location.href = "/controller/login";
            } else {
              window.location.href = "/";
            }
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
