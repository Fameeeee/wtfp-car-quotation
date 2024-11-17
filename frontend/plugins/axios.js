// plugins/axios.js
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const instance = axios.create({
    baseURL: 'http://localhost:3001/', // Replace with your backend URL
  })

  return {
    provide: {
      axios: instance,
    },
  }
})
