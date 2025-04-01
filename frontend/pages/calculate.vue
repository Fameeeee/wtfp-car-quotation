<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">กรอกข้อมูล</h2>
        <div class="flex space-x-4 mb-6">
            <button @click="selectedPayment = 'cash'"
                :class="{ 'bg-black text-white': selectedPayment === 'cash', 'bg-white text-black border': selectedPayment !== 'cash' }"
                class="px-6 py-2 rounded-lg border transition">
                ราคาซื้อสด
            </button>
            <button @click="selectedPayment = 'installment'"
                :class="{ 'bg-black text-white': selectedPayment === 'installment', 'bg-white text-black border': selectedPayment !== 'installment' }"
                class="px-6 py-2 rounded-lg border transition">
                คำนวณเงินผ่อน
            </button>
        </div>

        <div class="w-full max-w-md">
            <cashPayment v-if="selectedPayment === 'cash'" />
            <installmentPayment v-if="selectedPayment === 'installment'" />
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goBack"
                class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">กลับ</button>
            <button @click="goNext" class="py-3 px-4 text-white bg-[#980000] rounded-lg hover:bg-red-800">ต่อไป</button>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <p class="text-lg text-[#696969] mb-4">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="flex gap-4 justify-center">
                <button @click="discardChanges"
                    class="py-3 px-6 text-lg font-semibold text-white bg-[#980000] from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transform transition-transform duration-200 hover:scale-105">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';

const router = useRouter();
const selectedPayment = ref('cash');
const showModal = ref(false);

const goBack = () => showModal.value = true;
const goNext = () => {
    if (selectedPayment.value === 'cash') {
        localStorage.removeItem('installmentPlans');
    } else {
        localStorage.removeItem('cashPlan');
    }
    router.push('/select-accessories');
};
const closeModal = () => showModal.value = false;
const discardChanges = () => {
    showModal.value = false;
    router.push('/confirm-car');
};

definePageMeta({ middleware: 'staff-auth' });
</script>