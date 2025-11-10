import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ["@pinia/nuxt","@nuxt/ui"],
  css: [
    "~/public/assets/css/main.css",
    "~/public/assets/css/toast.css"
  ],
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      title: "Isuzu | Quotation",
    },
  },
  plugins: ["~/plugins/axios.js"],
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
      backendUrl: process.env.BACKEND_URL,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['autoprefixer']
    }
  },
});
