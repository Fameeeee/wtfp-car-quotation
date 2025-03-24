import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ['@pinia/nuxt','@nuxt/ui'],
  css: ['~/public/assets/css/main.css'],
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
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
