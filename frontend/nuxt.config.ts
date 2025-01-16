export default defineNuxtConfig({
  css: ["bootstrap/dist/css/bootstrap.min.css"],
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
});
