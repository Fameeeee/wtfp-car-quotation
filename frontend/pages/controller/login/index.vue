<template>
  <div class="main-container">
    <nav class="navbar">
      <img class="logo" src="../../../public/assets/IsuzuLogo.png" alt="">
    </nav>
    <div class="login-container">
      <div class="login-box">
        <h1 class="login-title">เข้าสู่ระบบ</h1>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">อีเมล</label>
            <input type="email" id="email" v-model="email" placeholder="กรอกอีเมล" required />
          </div>
          <div class="form-group">
            <label for="password">รหัสผ่าน</label>
            <input type="password" id="password" v-model="password" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <button type="submit" class="submit-button">เข้าสู่ระบบ</button>
        </form>
        <div class="register">
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
    const response = await axios.post('http://localhost:3001/staff/login', {
      email: email.value,
      password: password.value
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      router.push('/controller/dashboard');
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

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
}

img {
  height: 5vh;
  object-fit: contain;
  margin: 10px 0px;
}

nav {
  height: fit-content;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.login-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 1rem;
}

.login-box {
  width: 90%;
  max-width: 700px;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  height: fit-content;
}

.login-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #cccccc;
  border-radius: 4px;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 1rem;
  background-color: #007bff;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 2rem;
}

.submit-button:hover {
  background-color: #0056b3;
}

.register {
  text-align: center;
  font-size: 1rem;
  color: #666666;
  margin-top: 1rem;
}

</style>
