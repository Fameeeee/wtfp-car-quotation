<template>
  <div class="container">
    <div class="card">
      <div class="card-body">
        <h1 class="card-title">เข้าสู่ระบบ</h1>
        <form @submit.prevent="handleLogin">
          <div class="form">
            <label for="email" class="form-label">อีเมลล์</label>
            <input type="email" class="form-control" id="email" v-model="form.email"
              placeholder="Ex. john.doe@gmail.com" />
          </div>
          <div class="form">
            <label for="password" class="form-label">รหัสผ่าน</label>
            <input type="password" class="form-control" id="password" v-model="form.password"
              placeholder="Ex. password1234" />
          </div>
          <button type="submit" class="form-btn" :disabled="isLoading">เข้าสู่ระบบ</button>
        </form>
        <p class="register-link">
          ยังไม่มีบัญชื ? <NuxtLink to="/register" class="text-primary">สมัครสมาชิก</NuxtLink>
        </p>
        <p v-if="errorMessage" class="text-center text-danger">{{ errorMessage }}</p>
      </div>
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
    const response = await axios.post('http://localhost:3001/staff/login', form.value);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
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

<style scoped>
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


</style>
>>>>>>> Stashed changes
