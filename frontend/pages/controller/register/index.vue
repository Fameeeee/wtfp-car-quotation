<template>
  <div class="main-container">
    <nav class="navbar">
      <img class="logo" src="../../../public/assets/IsuzuLogo.png" alt="Isuzu Logo">
    </nav>
    <div class="register-container">
      <div class="register-box">
        <h1 class="register-title">ลงทะเบียน</h1>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="email">อีเมล</label>
            <input type="email" id="email" v-model="email" placeholder="กรอกอีเมล" required />
          </div>
          <div class="form-group">
            <label for="password">รหัสผ่าน</label>
            <input type="password" id="password" v-model="password" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">ยืนยันรหัสผ่าน</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="กรอกรหัสผ่าน" required />
          </div>
          <div class="form-group">
            <label for="firstname">ชื่อจริง</label>
            <input type="text" id="firstName" v-model="firstname" placeholder="กรอกชื่อจริง" required />
          </div>
          <div class="form-group">
            <label for="lastname">นามสกุล</label>
            <input type="text" id="lastName" v-model="lastname" placeholder="กรอกนามสกุล" required />
          </div>
          <div class="form-group">
            <label for="gender">เพศ</label>
            <select id="gender" v-model="gender" required>
              <option value="" disabled>เพศ</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
            </select>
          </div>
          <div class="form-group">
            <label for="phoneNumber">เบอร์โทรศัพท์</label>
            <input type="tel" id="phoneNumber" v-model="phone" placeholder="กรอกเบอร์โทรศัพท์" required />
          </div>
          <button type="submit" class="submit-button">ลงทะเบียน</button>
        </form>
        <div class="login">
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
    const response = await axios.post('http://localhost:3001/auth/register', {
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


.register-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  padding: 1rem;
}


.register-box {
  width: 100%;
  max-width: 700px;
  padding: 2rem;
  background: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  height: fit-content;
}


.register-title {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 1rem;
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
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}


.login {
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
  padding-bottom: 1rem;
}

</style>
