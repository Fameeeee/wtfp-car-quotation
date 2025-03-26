<template>
    <div class="flex flex-col items-center p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">ข้อมูลลูกค้า</h2>
        <div class="flex flex-col w-full max-w-lg">
            <div class="flex flex-col bg-white p-6 rounded-lg shadow-lg gap-4">
                <div class="flex flex-col items-center justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between text-lg font-medium text-gray-800 w-full">
                        <div class="font-semibold text-black">ชื่อลูกค้า</div>
                        <input type="text" v-model="customer.firstName" placeholder="ป้อนชื่อลูกค้า"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="saveToLocalStorage" />
                    </div>
                    <div v-if="errors.firstName" class="text-red-500 text-sm mt-1 italic">{{ errors.firstName }}</div>
                </div>

                <div class="flex flex-col items-center justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between text-lg font-medium text-gray-800 w-full">
                        <div class="font-semibold text-black">นามสกุล</div>
                        <input type="text" v-model="customer.lastName" placeholder="ป้อนนามสกุล"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="saveToLocalStorage" />
                    </div>
                    <div v-if="errors.lastName" class="text-red-500 text-sm mt-1 italic">{{ errors.lastName }}</div>
                </div>

                <div class="flex flex-col items-end justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between text-lg font-medium text-gray-800 w-full">
                        <div class="font-semibold text-black">เบอร์โทรศัพท์</div>
                        <input type="text" v-model="customer.phoneNumber" placeholder="ป้อนเบอร์โทรศัพท์"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="saveToLocalStorage" />
                    </div>
                    <div v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1 italic">{{ errors.phoneNumber }}</div>
                </div>

            </div>
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goBack"
                class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300 focus:outline-none">กลับ</button>
            <button @click="goNext"
                class="py-3 px-4 text-white bg-red-700 rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none"
                :disabled="!isFormValid">
                ต่อไป
            </button>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <p class="text-lg text-[#696969] mb-4">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="flex gap-4 justify-center">
                <button @click="discardChanges"
                    class="py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transform transition-transform duration-200 hover:scale-105">
                    ยืนยัน
                </button>
                <button @click="closeModal"
                    class="py-3 px-6 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showModal = ref(false);

const customer = ref({
    firstName: '',
    lastName: '',
    phoneNumber: ''
});

const errors = ref({
    firstName: '',
    lastName: '',
    phoneNumber: ''
});

const validateForm = () => {
    errors.value.firstName = customer.value.firstName ? '' : 'กรุณากรอกชื่อลูกค้า';
    errors.value.lastName = customer.value.lastName ? '' : 'กรุณากรอกนามสกุล';

    const phonePattern = /^[0-9]{10}$/;
    errors.value.phoneNumber = phonePattern.test(customer.value.phoneNumber) ? '' : 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)';

    return !errors.value.firstName && !errors.value.lastName && !errors.value.phoneNumber;
};

const isFormValid = computed(() => validateForm());

const saveToLocalStorage = () => {
    localStorage.setItem('customerDetails', JSON.stringify(customer.value));
};

const goBack = async () => {
    openModal();
};

const goNext = () => {
    if (validateForm()) {
        router.push('/add-customer');
    }
};

const openModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    localStorage.removeItem('customerDetails');
    router.push('/add-cost');
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>
