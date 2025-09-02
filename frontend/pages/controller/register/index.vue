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
            <h1 class="text-3xl font-bold text-gray-900 mb-2">ลงทะเบียน</h1>
            <p class="text-gray-600">สร้างบัญชีใหม่เพื่อใช้งานระบบ</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">ชื่อจริง</label>
                <input
                  id="firstName"
                  v-model="firstname"
                  type="text"
                  required
                  placeholder="กรอกชื่อจริง"
                  class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  id="lastName"
                  v-model="lastname"
                  type="text"
                  required
                  placeholder="กรอกนามสกุล"
                  class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                placeholder="กรอกอีเมล"
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">เพศ</label>
              <select
                id="gender"
                v-model="gender"
                required
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>เลือกเพศ</option>
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
              <input
                id="phoneNumber"
                v-model="phone"
                type="tel"
                required
                placeholder="กรอกเบอร์โทรศัพท์"
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
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
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
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
                กำลังลงทะเบียน...
              </span>
              <span v-else>ลงทะเบียน</span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว? 
              <NuxtLink to="/controller/login" class="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                เข้าสู่ระบบ
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

const config = useRuntimeConfig()
const api = useApi();

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const firstname = ref('');
const lastname = ref('');
const gender = ref('');
const phone = ref('');

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!');
    return;
  }

  try {
  const response = await api.post(`/auth/register`, {
      email: email.value,
      password: password.value,
      firstName: firstname.value,
      lastName: lastname.value,
      gender: gender.value,
      phoneNumber: phone.value,
    });

    if (response.status === 201) {
      alert('Registration successful!');
      router.push('/controller/login');
    } else {
      alert('Something went wrong, please try again.');
    }
  } catch (error) {
    console.error('Error registering:', error);
    alert(error.response?.data?.message || 'An error occurred while registering.');
  }
}

definePageMeta({
  layout: false,
});
</script>

<style scoped>
</style>
