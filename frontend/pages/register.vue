<template>
    <div class="container">
        <div class="card">
            <div class="card-body">
                <h1 class="card-title">สมัครสมาชิก</h1>
                <form @submit.prevent="registerUser">
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
                    <div class="form">
                        <label for="confirm-password" class="form-label">ยืนยันรหัสผ่าน</label>
                        <input type="password" class="form-control" id="confirm-password" v-model="form.confirmPassword"
                            placeholder="Ex. password1234" />
                    </div>
                    <div class="form">
                        <label for="firstname" class="form-label">ชื่อจริง</label>
                        <input type="text" class="form-control" id="firstname" v-model="form.firstName"
                            placeholder="Ex. John" />
                    </div>
                    <div class="form">
                        <label for="lastname" class="form-label">นามสกุล</label>
                        <input type="text" class="form-control" id="lastname" v-model="form.lastName"
                            placeholder="Ex. Doe" />
                    </div>
                    <div class="form">
                        <label for="gender" class="form-label">เพศ</label>
                        <select class="form-select" id="gender" v-model="form.gender">
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                        </select>
                    </div>
                    <div class="form">
                        <label for="phonenumber" class="form-label">เบอร์โทรศัพท์</label>
                        <input type="tel" class="form-control" id="phonenumber" v-model="form.phoneNumber"
                            placeholder="Ex. 0123456789" />
                    </div>
                    <button type="submit" class="form-btn">สมัครสมาชิก</button>
                </form>
                <p class="text-center mt-3">
                    มีบัญชีผู้ใช้อยู่แล้ว ? <NuxtLink to="/" class="login-link">เข้าสู่ระบบ</NuxtLink>
                </p>
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
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  gender: 'ชาย',
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
    console.log(errorMessage.value);
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'รหัสผ่านไม่ตรงกัน';
    console.log(errorMessage.value);
    return;
  }

  if (!/^\d{10}$/.test(form.value.phoneNumber)) {
    errorMessage.value = 'เบอร์โทรศัพท์ต้องมีตัวเลข 10 หลัก';
    console.log(errorMessage.value);
    return;
  }

  try {
    await axios.post('http://localhost:3001/staff/register', form.value);
    successMessage.value = 'สมัครสมาชิกสำเร็จ!';
    console.log(successMessage.value);
    router.push('/');
  } catch (error) {
    errorMessage.value = error.response ? error.response.data.message : 'An error occurred.';
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

.card {
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.card-body {
    gap: 10px;
}

.card-title {
    text-align: center;
    padding: 5px;
    font-size: 2rem;
}

.form {
    margin-bottom: 20px;
}

.form-label {
    font-size: 1.2rem;
}

.form-control,
.form-select {
    padding: 8px;
}

.form-btn {
    border: none;
    font-size: 1.2rem;
    background: #146aff;
    color: white;
    width: 100%;
    padding: 5px;
    border-radius: 5px;
}

.login-link {
    margin-top: 15px;
    text-align: center;
    font-size: 1rem;
}
</style>
