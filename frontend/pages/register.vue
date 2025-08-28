<template>
  <div class="flex items-center justify-center mt-10 bg-white px-4">
    <div class="w-full max-w-md p-6 shadow-lg bg-white rounded-lg text-black">
      <h1 class="text-2xl font-semibold text-center text-gray-800 mb-6">สมัครสมาชิก</h1>

      <form @submit.prevent="registerUser" class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-black">อีเมลล์</label>
          <input type="email" id="email" v-model="form.email" placeholder="Ex. john.doe@gmail.com"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-black">รหัสผ่าน</label>
          <input type="password" id="password" v-model="form.password" placeholder="Ex. password1234"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="space-y-2">
          <label for="confirm-password" class="text-black">ยืนยันรหัสผ่าน</label>
          <input type="password" id="confirm-password" v-model="form.confirmPassword" placeholder="Ex. password1234"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="space-y-2">
          <label for="firstname" class="text-black">ชื่อจริง</label>
          <input type="text" id="firstname" v-model="form.firstName" placeholder="Ex. John"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="space-y-2">
          <label for="lastname" class="text-black">นามสกุล</label>
          <input type="text" id="lastname" v-model="form.lastName" placeholder="Ex. Doe"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div class="space-y-2">
          <label for="gender" class="text-black">เพศ</label>
          <select id="gender" v-model="form.gender"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
          </select>
        </div>

        <div class="space-y-2">
          <label for="phonenumber" class="text-black">เบอร์โทรศัพท์</label>
          <input type="tel" id="phonenumber" v-model="form.phoneNumber" placeholder="Ex. 0123456789"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <button type="submit" class="w-full py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          สมัครสมาชิก
        </button>
      </form>

      <p class="text-center text-sm mt-3 text-gray-600">
        มีบัญชีผู้ใช้อยู่แล้ว ?
        <NuxtLink to="/" class="text-blue-500 font-medium hover:underline">เข้าสู่ระบบ</NuxtLink>
      </p>

      <p v-if="errorMessage" class="mt-2 text-center text-red-500">{{ errorMessage }}</p>
      <p v-if="successMessage" class="mt-2 text-center text-green-500">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  phoneNumber: ''
});

const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const registerUser = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (
    !form.value.email ||
    !form.value.password ||
    !form.value.confirmPassword ||
    !form.value.firstName ||
    !form.value.lastName ||
    !form.value.gender ||
    !form.value.phoneNumber
  ) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน';
    return;
  }

  if (!/^\d{10}$/.test(form.value.phoneNumber)) {
    errorMessage.value = 'เบอร์โทรศัพท์ต้องมีตัวเลข 10 หลัก';
    return;
  }

  try {
    await axios.post(`${backendUrl}/auth/register`, form.value);
    successMessage.value = 'สมัครสมาชิกสำเร็จ!';
    alert('สมัครสมาชิกสำเร็จ!');
    router.push('/');
  } catch (error) {
    errorMessage.value = error.response ? error.response.data.message : 'เกิดข้อผิดพลาด';
    alert(errorMessage.value);
  }
};
</script>