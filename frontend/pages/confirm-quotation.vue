<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ยืนยันรายการ</h2>
        <div class="flex flex-col w-full max-w-lg p-2 gap-2">
            <h2 class="text-black">เรียนคุณ {{ customer?.firstName }} {{ customer?.lastName }}</h2>
            <carDetailsTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-2 gap-2">
            <h2 class="text-black"><u>เงื่อนไขการชำระ : {{ paymentPlan }}</u></h2>
            <paymentTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-2 gap-2">
            <h2 class="text-black">อุปกรณ์ตกแต่ง</h2>
            <div class="bg-gray-300">This is for accessories</div>
        </div>
        <div class="flex flex-col w-full max-w-lg p-2 gap-2">
            <h2 class="text-black">หมายเหตุ</h2>
            <div class="bg-gray-600">This is for note</div>
        </div>
        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import carDetailsTable from '~/components/user/carDetailsTable.vue';
import paymentTable from '~/components/user/paymentTable.vue';
import buttonGroup from '~/components/user/buttonGroup.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const customer = ref('');
const paymentPlan = ref('');

onMounted(() => {
    if (localStorage.getItem('cashPlan')) {
        paymentPlan.value = 'เงินสด';
    } else if (localStorage.getItem('installmentPlans')) {
        paymentPlan.value = 'ผ่อนชำระ';
    }
    const customerData = localStorage.getItem('customerDetails');
    if (customerData) {
        try {
            customer.value = JSON.parse(customerData);
        } catch (error) {
            console.error('Error parsing customerDetails:', error);
        }
    }
})

const goBack = () => {
    router.push('/customer-details');
};

const goNext = () => {
    router.push('/quotation-success');
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>