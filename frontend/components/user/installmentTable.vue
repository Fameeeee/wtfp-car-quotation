<template>
    <div class="overflow-x-auto bg-white border shadow-md">
        <table class="min-w-full text-sm text-center text-black">
            <thead class="bg-[#980000]">
                <tr>
                    <th class="px-2 py-1 border scale-text text-white border-black">ส่วนลด</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ส่วนเพิ่ม</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ราคาสุทธิ</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">จำนวนเงินดาวน์</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">จำนวนเดือน</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">อัตราดอกเบี้ย</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ค่างวดต่อเดือน</th>
                </tr>
            </thead>
            <template v-for="(order, index) in installmentPlans" :key="order.orderNumber">
                <tbody>
                    <tr>
                        <td class="border scale-text">{{ order.specialDiscount ?? '0' }}</td>
                        <td class="border scale-text">{{ order.additionPrice ?? '0' }}</td>
                        <td class="border scale-text">{{ calculateNetPrice(order) ?? '0' }}</td>
                        <td class="border scale-text">{{ order.downPayment }}</td>
                        <td class="border scale-text">
                            <div v-for="(plan, i) in order.planDetails" :key="i" class="relative">
                                {{ plan.period }}
                                <hr v-if="plan.period && i !== order.planDetails.length - 1" class="my-1 border-t-1" />
                            </div>
                        </td>
                        <td class="border scale-text">
                            <div v-for="(plan, i) in order.planDetails" :key="i" class="relative">
                                {{ plan.interestRate ?? '0' }}
                                <hr v-if="i !== order.planDetails.length - 1" class="my-1 border-t-1" />
                            </div>
                        </td>
                        <td class="border scale-text">
                            <div v-for="(plan, i) in order.planDetails" :key="i" class="relative">
                                {{ calculateMonthlyInstallment(order, plan) ?? '0' }}
                                <hr v-if="calculateMonthlyInstallment(order, plan) && i !== order.planDetails.length - 1"
                                    class="my-1 border-t-1" />
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tbody v-if="index !== installmentPlans.length - 1">
                    <tr>
                        <td colspan="7" class="h-2"></td>
                    </tr>
                </tbody>
            </template>
        </table>
    </div>
</template>



<script setup>
defineProps({
    installmentPlans: {
        type: Array,
        required: true
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