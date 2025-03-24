<template>
  <div class="flex justify-center bg-gray-100 p-8">
    <div class="w-full max-w-lg p-8 bg-white rounded-2xl border shadow-xl">
      <h1 class="text-3xl font-bold text-center text-gray-800">เข้าสู่ระบบ</h1>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-6 mt-6">
        <div>
          <label for="email" class="block text-lg text-gray-700 font-medium">อีเมลล์</label>
          <input type="email" id="email" v-model="form.email" placeholder="Ex. john.doe@gmail.com"
            class="w-full px-5 py-3 mt-2 text-lg border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>

        <div>
          <label for="password" class="block text-lg text-gray-700 font-medium">รหัสผ่าน</label>
          <input type="password" id="password" v-model="form.password" placeholder="Ex. password1234"
            class="w-full px-5 py-3 mt-2 text-lg border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full py-3 mt-6 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition">
          {{ isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
        </button>
      </form>

      <p class="mt-6 text-lg text-center text-gray-600">
        ยังไม่มีบัญชี ?
        <NuxtLink to="/register" class="text-blue-500 hover:underline">สมัครสมาชิก</NuxtLink>
      </p>

      <p v-if="errorMessage" class="mt-4 text-lg text-center text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';


const form = ref({
  email: '',
  password: ''
});
const emailError = ref(false);
const passwordError = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();

const handleLogin = async () => {
  emailError.value = false;
  passwordError.value = false;
  errorMessage.value = '';

  if (!form.value.email) {
    emailError.value = true;
    return;
  }
  if (!form.value.password) {
    passwordError.value = true;
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post('http://localhost:3001/auth/login', form.value);

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      router.push('/home');
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
</script>

<!-- <style scoped>
* {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

.container {
  margin-top: 20px;
}

.card{
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.card-body{
  gap: 10px;
}

.card-title{
  text-align: center;
  padding: 5px;
  font-size: 2rem;
}

.form{
  margin-bottom: 20px;
}

.form-label{
  font-size: 1.2rem;
}

.form-control{
  padding: 8px;
}

.form-btn{
  border: none;
  font-size: 1.2rem;
  background: #146aff;
  color: white;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
}

.register-link{
  margin-top: 15px;
  text-align: center;
  font-size: 1rem;
}


</style> -->
