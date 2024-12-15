<template>
    <div class="flex justify-center align-items-center mt-5">
      <div class="card shadow-sm w-100" style="max-width: 400px;">
        <div class="card-body">
          <h1 class="card-title text-center mb-4">เข้าสู่ระบบ</h1>
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">อีเมลล์</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="form.email"
                placeholder="Ex. john.doe@gmail.com"
              />
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">รหัสผ่าน</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="form.password"
                placeholder="Ex. password1234"
              />
            </div>
            <button type="submit" class="btn btn-primary w-100">เข้าสู่ระบบ</button>
          </form>
          <p class="text-center mt-3">
            ยังไม่มีบัญชื ? <NuxtLink to="/register" class="text-primary">สมัครสมาชิก</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const form = ref({
    email: '',
    password: ''
  });
  
  const handleLogin = () => {
    if (!form.value.email || !form.value.password) {
      console.error('Please fill out all fields');
      return;
    }
    console.log('Form submitted:', form.value);
  };
  </script>
  
  <style scoped>
  body,
  html {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
  }
  
  .flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .card {
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    .card {
      max-width: 90%;
      margin: 0 15px;
    }
  }
  </style>