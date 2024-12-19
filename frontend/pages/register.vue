<template>
    <div class="flex justify-content-center align-items-center mt-2">
        <div class="card shadow-sm w-100" style="max-width: 400px; height: auto; overflow-y: auto;">
            <div class="card-body">
                <h1 class="card-title text-center mb-4">สมัครสมาชิก</h1>
                <form @submit.prevent="registerUser">
                    <div class="mb-3">
                        <label for="email" class="form-label">อีเมลล์</label>
                        <input type="email" class="form-control" id="email" v-model="form.email"
                            placeholder="Ex. john.doe@gmail.com" />
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">รหัสผ่าน</label>
                        <input type="password" class="form-control" id="password" v-model="form.password"
                            placeholder="Ex. password1234" />
                    </div>
                    <div class="mb-3">
                        <label for="confirm-password" class="form-label">ยืนยันรหัสผ่าน</label>
                        <input type="password" class="form-control" id="confirm-password" v-model="form.confirmPassword"
                            placeholder="Ex. password1234" />
                    </div>
                    <div class="mb-3">
                        <label for="firstname" class="form-label">ชื่อจริง</label>
                        <input type="text" class="form-control" id="firstname" v-model="form.firstName"
                            placeholder="Ex. John" />
                    </div>
                    <div class="mb-3">
                        <label for="lastname" class="form-label">นามสกุล</label>
                        <input type="text" class="form-control" id="lastname" v-model="form.lastName"
                            placeholder="Ex. Doe" />
                    </div>
                    <div class="row">
                        <div class="col-6 mb-3">
                            <label for="gender" class="form-label">เพศ</label>
                            <select class="form-select" id="gender" v-model="form.gender">
                                <option value="male">ชาย</option>
                                <option value="female">หญิง</option>
                            </select>
                        </div>
                        <div class="col-6 mb-3">
                            <label for="age" class="form-label">อายุ</label>
                            <input type="number" class="form-control" id="age" v-model="form.age"
                                placeholder="Ex. 20" />
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="phonenumber" class="form-label">เบอร์โทรศัพท์</label>
                        <input type="tel" class="form-control" id="phonenumber" v-model="form.phoneNumber"
                            placeholder="Ex. 0123456789" />
                    </div>
                    <button type="submit" class="btn btn-primary w-100">สมัครสมาชิก</button>
                </form>
                <p class="text-center mt-3">
                    มีบัญชีผู้ใช้อยู่แล้ว ? <NuxtLink to="/" class="text-primary">เข้าสู่ระบบ</NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            form: {
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                gender: 'ชาย',
                age: '',
                phoneNumber: ''
            },
            errorMessage: '',
            successMessage: ''
        };
    },
    methods: {
        async registerUser() {
            if (
                !this.form.email ||
                !this.form.password ||
                !this.form.confirmPassword ||
                !this.form.firstName ||
                !this.form.lastName ||
                !this.form.gender ||
                !this.form.age ||
                !this.form.phoneNumber
            ) {
                this.errorMessage = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
                console.log(this.errorMessage)
                return;
            }

            if (this.form.password !== this.form.confirmPassword) {
                this.errorMessage = 'รหัสผ่านไม่จรงกัน';
                console.log(this.errorMessage)
                return;
            }

            if (!/^\d{10}$/.test(this.form.phoneNumber)) {
                this.errorMessage = 'เบอร์โทรศัพท์ต้องมีตัวเลข 10 หลัก';
                console.log(this.errorMessage);
                return;
            }

            try {
                await axios.post('http://localhost:3001/staff', this.form);
                this.successMessage = 'สมัครสมาชิกสำเร็จ!';
                this.errorMessage = '';
                console.log(this.successMessage)
                this.$router.push('/');
            } catch (error) {
                this.errorMessage = error.response ? error.response.data.message : 'An error occurred.';
                this.successMessage = '';
            }
        }
    },

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
    overflow-y: auto;
}

@media (max-width: 768px) {
    .card {
        max-width: 100%;
        margin: 0 15px;
    }
}
</style>
