<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">กรอกข้อมูล</h2>
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

        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalConfirm v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalConfirm from '~/components/user/modalConfirm.vue';
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';

const router = useRouter();
const selectedPayment = ref('cash');
const showModal = ref(false);

const goBack = () => {
    showModal.value = true;
}
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
    localStorage.removeItem('cashPlan');
    localStorage.removeItem('installmentPlans');
    router.push('/confirm-car');
};

definePageMeta({ middleware: 'staff-auth' });
</script>