<template>
  <div class="min-h-screen bg-[#F5F5F5] flex flex-col">
    <!-- Header with logo -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex justify-center">
        <img class="h-12 object-contain" src="/assets/IsuzuLogo.png" alt="Isuzu Logo" />
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg border shadow-sm p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h1>
            <p class="text-gray-600">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="กรอกอีเมล"
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="{ 'border-red-500': emailError }"
              />
              <p v-if="emailError" class="mt-1 text-sm text-red-600">กรุณากรอกอีเมล</p>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                placeholder="กรอกรหัสผ่าน"
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="{ 'border-red-500': passwordError }"
              />
              <p v-if="passwordError" class="mt-1 text-sm text-red-600">กรุณากรอกรหัสผ่าน</p>
            </div>

            <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-md">
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
              </span>
              <span v-else>เข้าสู่ระบบ</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              ยังไม่มีบัญชี? 
              <NuxtLink to="/controller/register" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                ลงทะเบียน
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { setToken } from '~/composables/useAuth'

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const email = ref('');
const password = ref('');
const emailError = ref(false);
const passwordError = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const handleLogin = async () => {
  emailError.value = false;
  passwordError.value = false;
  errorMessage.value = '';


  if (!email.value) {
    emailError.value = true;
    return;
  }
  if (!password.value) {
    passwordError.value = true;
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post(`${backendUrl}/auth/login`, {
      email: email.value,
      password: password.value
    }, { withCredentials: true });

    if (response.status >= 200 && response.status < 300) {
      // backend set cookie; if it still returns a token, store it for compatibility
      if (response.data?.access_token) setToken(response.data.access_token);
      router.push('/controller/staff');
    } else {
      errorMessage.value = 'Login failed: No token received.';
    }
  } catch (error) {
    console.error(error.response || error);
    errorMessage.value = error.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่';
  } finally {
    isLoading.value = false;
  }
};
definePageMeta({
  layout: false,
});
</script>

<style scoped></style>
