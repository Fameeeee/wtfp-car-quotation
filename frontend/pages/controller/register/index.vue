<template>
  <div class="main-container flex flex-col h-screen m-0 text-black" style="margin: 0px;">
    <nav class="navbar h-fit bg-white flex justify-center items-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
      <img class="logo h-[5vh] object-contain my-2" src="../../../public/assets/IsuzuLogo.png" alt="Isuzu Logo"
        style="height: 5vh; margin-block: 10px;">
    </nav>
    <div class="register-container flex-1 flex justify-center items-center bg-[#f5f5f5]" style="padding: 1rem;">
      <div class="register-box w-full max-w-[700px] p-8 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] rounded-md h-fit"
        style="padding: 2rem;">
        <h1 class="register-title text-center" style="font-size: 2.5rem; margin-bottom: 1rem">ลงทะเบียน</h1>
        <form @submit.prevent="handleRegister">
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="email" style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block;">อีเมล</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="email" id="email" v-model="email" placeholder="กรอกอีเมล"
              required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="password" style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">รหัสผ่าน</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="password" id="password" v-model="password"
              placeholder="กรอกรหัสผ่าน" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="confirmPassword"
              style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">ยืนยันรหัสผ่าน</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="password" id="confirmPassword" v-model="confirmPassword"
              placeholder="กรอกรหัสผ่าน" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="firstname" style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">ชื่อจริง</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="text" id="firstName" v-model="firstname"
              placeholder="กรอกชื่อจริง" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="lastname" style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">นามสกุล</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="text" id="lastName" v-model="lastname"
              placeholder="กรอกนามสกุล" required />
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="gender" style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">เพศ</label>
            <select class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" id="gender" v-model="gender" required>
              <option value="" disabled>เพศ</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label for="phoneNumber"
              style="margin-bottom: 0.5rem; font-size: 1.5rem; display: block">เบอร์โทรศัพท์</label>
            <input class="w-full p-4 text-base border border-[#cccccc] rounded-sm"
              style="padding: 1rem; font-size: 1rem;" type="tel" id="phoneNumber" v-model="phone"
              placeholder="กรอกเบอร์โทรศัพท์" required />
          </div>
          <button type="submit"
            class="submit-button block w-full p-4 bg-[#007bff] text-white text-xl font-bold border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-[#0056b3]"
            style="display: block; padding: 1rem; font-size: 1.5rem; font-weight: bold">ลงทะเบียน</button>
        </form>
        <div class="login text-center" style="margin-top: 1rem; font-size: 1rem; padding-bottom: 1rem;">
          มีบัญชีอยู่แล้ว ? <NuxtLink to="/controller/login">เข้าสู่ระบบ</NuxtLink>
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
    const response = await axios.post(`${backendUrl}/auth/register`, {
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
