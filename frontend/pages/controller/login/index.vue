<template>
  <div class="main-container flex flex-col h-screen " style="margin: 0;">
    <nav class="navbar h-fit bg-white flex justify-center items-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
      <img class="logo h-[5vh] object-contain" style="margin-block: 10px;" src="../../../public/assets/IsuzuLogo.png"
        alt="">
    </nav>
    <div class="login-container flex-1 flex justify-center items-center bg-[#f5f5f5]" style="padding: 1rem;">
      <div class="login-box w-[90%] max-w-[700px] bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-md h-fit"
        style="padding: 2rem;">
        <h1 class="login-title text-center" style="font-size: 2.5rem; margin-bottom: 1rem;">เข้าสู่ระบบ</h1>
        <form @submit.prevent="handleLogin">
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 1.5rem;" for="email">อีเมล</label>
            <input class="w-full text-base border border-[#cccccc] rounded-sm" style="padding: 0.8rem;" type="email"
              id="email" v-model="email" placeholder="กรอกอีเมล" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-size: 1.5rem;" for="password">รหัสผ่าน</label>
            <input class="w-full text-base border border-[#cccccc] rounded-sm" style="padding: 0.8rem;" type="password"
              id="password" v-model="password" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <button type="submit"
            class="submit-button block w-full bg-[#007bff] text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-[#0056b3]"
            style="font-size: 1.25rem; margin-top: 2rem; font-weight: bold; padding: 1rem;">เข้าสู่ระบบ</button>
        </form>
        <div class="register text-center text-[#666666]" style="margin-top: 1rem; font-size: 1rem;">
          ยังไม่มีบัญชี ? <NuxtLink to="/controller/register">ลงทะเบียน</NuxtLink>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

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
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
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
