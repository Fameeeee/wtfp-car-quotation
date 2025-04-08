<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ยืนยันรายการ</h2>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1">
            <h2 class="text-black">เรียนคุณ {{ customer?.firstName }} {{ customer?.lastName }}</h2>
            <carDetailsTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black"><u>เงื่อนไขการชำระ : {{ paymentPlan }}</u></h2>
            <cashTable v-if="paymentPlan === 'เงินสด'" :cashPlan="cashPlan" />
            <installmentTable v-else-if="paymentPlan === 'ผ่อนชำระ'" :installmentPlans="installmentPlans" />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black">อุปกรณ์ตกแต่ง</h2>
            <accessoriesTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black">หมายเหตุ</h2>
            <noteField />
        </div>
        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import carDetailsTable from '~/components/user/carDetailsTable.vue';
import cashTable from '~/components/user/cashTable.vue';
import installmentTable from '~/components/user/installmentTable.vue';
import accessoriesTable from '~/components/user/accessoriesTable.vue';
import noteField from '~/components/user/noteField.vue';
import buttonGroup from '~/components/user/buttonGroup.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const customer = ref('');
const paymentPlan = ref('');
const isCashPlan = ref(false);
const isInstallmentPlan = ref(false);
const cashPlan = ref({});
const installmentPlans = ref([]);

onMounted(() => {
    const storedCashPlan = localStorage.getItem('cashPlan');
    const storedInstallmentPlans = localStorage.getItem('installmentPlans');
    const customerData = localStorage.getItem('customerDetails');

    if (storedCashPlan) {
        paymentPlan.value = 'เงินสด';
        cashPlan.value = JSON.parse(storedCashPlan);
    } else if (storedInstallmentPlans) {
        paymentPlan.value = 'ผ่อนชำระ';
        installmentPlans.value = JSON.parse(storedInstallmentPlans);
    }

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