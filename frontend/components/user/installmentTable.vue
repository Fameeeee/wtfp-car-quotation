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
                        <td class="border scale-text">{{ calculateDownPayment(order) }}</td>
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
                                <hr v-if="i !== order.planDetails.length - 1" class="my-1 border-t-1" />
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const installmentPlans = ref([]);
const carPrice = ref(0);
const activePlan = ref({});

const route = useRoute();
const quotationId = route.params.id;

const fetchInstallmentPlansFromLocalStorage = () => {
    const plansFromLocalStorage = JSON.parse(localStorage.getItem('installmentPlans') || '[]');
    installmentPlans.value = plansFromLocalStorage;
};

const fetchInstallmentPlansFromApi = async () => {
    try {
        const response = await axios.get(`${backendUrl}/quotation/${quotationId}`);
        installmentPlans.value = response.data.installmentPlans || [];
        carPrice.value = response.data.carDetails?.price || 0;

        if (response.data.carDetails?.downPaymentPercent) {
            activePlan.value.downPaymentPercent = response.data.carDetails.downPaymentPercent;
        }

    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
};

onMounted(() => {
    if (quotationId) {
        fetchInstallmentPlansFromApi();
    } else {
        fetchInstallmentPlansFromLocalStorage();
        setCarPrice();
    }
});

const setCarPrice = () => {
    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        const carData = JSON.parse(storedCar);
        carPrice.value = carData?.price || 0;
    }
};

const calculateNetPrice = (order) => {
    const discount = order.specialDiscount ?? 0;
    const additionPrice = order.additionPrice ?? 0;
    return carPrice.value - discount + additionPrice;
};

const calculateDownPayment = (order) => {
    const downPaymentPercent = order.downPaymentPercent ?? 0;
    const netPrice = calculateNetPrice(order);
    return Math.round((downPaymentPercent / 100) * netPrice);
};

const calculateMonthlyInstallment = (order, plan) => {
    if (plan.interestRate == null) return null;

    const netPrice = calculateNetPrice(order);
    const downPayment = calculateDownPayment(order);
    const loanAmount = netPrice - downPayment;
    const interestRate = plan.interestRate;
    const period = plan.period;

    if (interestRate === 0) {
        return Math.round(loanAmount / period);
    }

    const monthlyRate = (interestRate / 100) / 12;
    const factor = Math.pow(1 + monthlyRate, period);

    const monthlyPayment = loanAmount * ((monthlyRate * factor) / (factor - 1));

    return Math.round(monthlyPayment);
};

watch(() => activePlan.value.downPaymentPercent, (newDownPaymentPercent) => {
    activePlan.value.downPayment = calculateDownPayment(newDownPaymentPercent);
});
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