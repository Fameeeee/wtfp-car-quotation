<template>
    <div class="overflow-x-auto bg-white border shadow-md border-black">
        <table class="min-w-full text-sm text-center text-black">
            <thead class="bg-gray-300">
                <tr v-if="isCashPlan">
                    <th class="px-1 py-1 border scale-text">ส่วนลด</th>
                    <th class="px-1 py-1 border scale-text">ส่วนเพิ่ม</th>
                    <th class="px-1 py-1 border scale-text">ราคาสุทธิ</th>
                </tr>
                <tr v-if="isInstallmentPlan">
                    <th class="px-2 py-1 border scale-text">ส่วนลด</th>
                    <th class="px-2 py-1 border scale-text">ส่วนเพิ่ม</th>
                    <th class="px-2 py-1 border scale-text">ราคาสุทธิ</th>
                    <th class="px-2 py-1 border scale-text">จำนวนเงินดาวน์</th>
                    <th class="px-2 py-1 border scale-text">จำนวนเดือน</th>
                    <th class="px-2 py-1 border scale-text">อัตราดอกเบี้ย</th>
                    <th class="px-2 py-1 border scale-text">ค่างวดต่อเดือน</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="isCashPlan">
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.specialDiscount ?? '0' }}</td>
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.specialAddition ?? '0' }}</td>
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.totalPrice }}</td>
                </tr>
                <tr v-if="isInstallmentPlan" v-for="order in installmentPlans" :key="order.orderNumber">
                    <td class="border scale-text">{{ order.specialDiscount ?? '0' }}</td>
                    <td class="border scale-text">{{ order.additionPrice ?? '0' }}</td>
                    <td class="border scale-text">{{ calculateNetPrice(order) ?? '0' }}</td>
                    <td class="border scale-text">{{ order.downPayment }}</td>
                    <td class="border scale-text">
                        <div v-for="(plan, index) in order.planDetails" :key="index" class="relative">
                            {{ plan.period }}
                            <hr v-if="plan.period && index !== order.planDetails.length - 1" class="my-1 border-t-1" />
                        </div>
                    </td>

                    <td class="border scale-text">
                        <div v-for="(plan, index) in order.planDetails" :key="index" class="relative">
                            {{ plan.interestRate ?? '0' }}
                            <hr v-if="index !== order.planDetails.length - 1" class="my-1 border-t-1" />
                        </div>
                    </td>

                    <td class="border scale-text">
                        <div v-for="(plan, index) in order.planDetails" :key="index" class="relative">
                            {{ calculateMonthlyInstallment(order, plan) ?? '0' }}
                            <hr v-if="calculateMonthlyInstallment(order, plan) && index !== order.planDetails.length - 1"
                                class="my-1 border-t-1" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isCashPlan = ref(false);
const isInstallmentPlan = ref(false);
const cashPlan = ref({
    specialDiscount: '',
    specialAddition: '',
    totalPrice: ''
});
const installmentPlans = ref([]);

onMounted(() => {
    const storedCashPlan = localStorage.getItem('cashPlan');
    const storedInstallmentPlan = localStorage.getItem('installmentPlans');

    if (storedCashPlan) {
        isCashPlan.value = true;
        cashPlan.value = JSON.parse(storedCashPlan);
    } else if (storedInstallmentPlan) {
        isInstallmentPlan.value = true;
        installmentPlans.value = JSON.parse(storedInstallmentPlan);
    }
});

const calculateNetPrice = (order) => {
    const discount = order.specialDiscount ?? 0;
    const additionPrice = order.additionPrice ?? 0;
    return (order.downPayment + discount + additionPrice).toLocaleString();
};

const calculateMonthlyInstallment = (order, plan) => {
    if (!plan.interestRate) {
        return '0';
    }

    const period = plan.period;
    const downPayment = order.downPayment;
    const interestRate = plan.interestRate ?? 0;

    const loanAmount = order.downPayment;
    const totalLoanWithInterest = loanAmount + (loanAmount * (interestRate / 100));
    const monthlyInstallment = Math.round(totalLoanWithInterest / period);

    return `${monthlyInstallment}`;
};
</script>

<style scoped>
.overflow-x-auto {
    max-width: 100%;
    max-height: fit-content;
    overflow: auto;
}

table {
    width: 100%;
    table-layout: fixed;
}

.scale-text {
    font-size: 0.8rem;
    overflow: hidden;
    line-height: 1.5;
    width: 100%;
    box-sizing: border-box;
    word-break: break-word;
}

th,
td {
    overflow: hidden;
}

hr {
    margin: 0;
}

@media (max-width: 600px) {
    .scale-text {
        font-size: 0.5rem;
    }
}
</style>