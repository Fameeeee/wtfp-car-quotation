<template>
  <div class="flex mt-10 items-center justify-center bg-white px-4">
    <div class="w-full max-w-md p-6 shadow-lg bg-white flex flex-col text-black">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">เข้าสู่ระบบ</h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-black">อีเมลล์</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            placeholder="Ex. john.doe@gmail.com"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-500': emailError}"
          />
          <p v-if="emailError" class="text-red-500 text-sm">กรุณากรอกอีเมลล์</p>
        </div>

        <div class="space-y-2">
          <label for="password" class="text-black">รหัสผ่าน</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            placeholder="Ex. password1234"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-500': passwordError}"
          />
          <p v-if="passwordError" class="text-red-500 text-sm">กรุณากรอกรหัสผ่าน</p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          เข้าสู่ระบบ
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        ยังไม่มีบัญชี?
        <NuxtLink to="/register" class="text-blue-500 font-medium hover:underline">สมัครสมาชิก</NuxtLink>
      </p>

      <p v-if="errorMessage" class="mt-2 text-center text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi'
import { useNotification } from '~/composables/useNotification'
import { setToken } from '~/composables/useAuth.ts'

const config = useRuntimeConfig()
const api = useApi();
const toast = useNotification();

const form = ref({ email: '', password: '' });
const emailError = ref(false);
const passwordError = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  emailError.value = !form.value.email;
  passwordError.value = !form.value.password;
  errorMessage.value = '';

  if (emailError.value || passwordError.value) {
    toast.warning('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
    return;
  }

  isLoading.value = true;

  try {
    const response = await api.post('/auth/login', form.value);
    if (response.status >= 200 && response.status < 300 && response.data?.data?.access_token) {
      setToken(response.data.data.access_token);
      toast.success('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปหน้าหลัก...');
      setTimeout(() => {
        router.push('/home');
      }, 1000);
    } else {
      errorMessage.value = 'Login failed: No token received.';
      toast.error('เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
    }
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่';
    toast.apiError(error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  } finally {
    isLoading.value = false;
  }
};
</script>
