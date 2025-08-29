<template>
        <div class="overflow-x-auto bg-white border">
            <table class="min-w-full text-[11px] text-center text-black">
            <thead class="bg-[#980000]">
                <tr>
                      <th class="px-1.5 py-0.5 border scale-text text-white border-black">ลำดับ</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ราคารถ</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ส่วนลด</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ส่วนเพิ่ม</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">ราคาสุทธิ</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">เงินดาวน์</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">จำนวนเดือน</th>
                    <th class="px-2 py-1 border scale-text text-white border-black">อัตราดอกเบี้ย</th>
                      <th class="px-1.5 py-0.5 border scale-text text-white border-black">ค่างวดต่อเดือน</th>
                </tr>
            </thead>
            <tbody v-for="(order, index) in installmentPlans" :key="order.orderNumber">
                <tr v-for="(plan, i) in (order.planDetails || [])" :key="i">
                    <!-- merged cells per order -->
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ order.orderNumber }}</td>
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ formatBaht(carPrice) }}</td>
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ formatBaht(order.specialDiscount ?? 0) }}</td>
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ formatBaht(order.additionPrice ?? 0) }}</td>
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ formatBaht(calculateNetPrice(order)) }}</td>
                      <td v-if="i === 0" :rowspan="(order.planDetails || []).length" class="border scale-text px-1.5 py-0.5">{{ formatBaht(calculateDownPayment(order)) }}</td>

                    <!-- per-plan cells -->
                      <td class="border scale-text px-1.5 py-0.5">{{ plan?.period ?? '-' }}</td>
                      <td class="border scale-text px-1.5 py-0.5">{{ plan?.interestRate ?? '-' }}</td>
                      <td class="border scale-text px-1.5 py-0.5">{{ plan?.interestRate == null ? '-' : formatBaht(calculateMonthlyInstallment(order, plan)) }}</td>
                </tr>

                <!-- spacing row between orders -->
                <tr v-if="index !== installmentPlans.length - 1">
                    <td :colspan="9" class="h-1"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>



<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const installmentPlans = ref([]);
const carPrice = ref(0);
const activePlan = ref({});

const route = useRoute();
const quotationId = route.params.id;
const quotationStore = useQuotationStore();

const fetchInstallmentPlansFromStore = () => {
    installmentPlans.value = quotationStore.installmentPlans || [];
    setCarPriceFromStore();
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
        fetchInstallmentPlansFromStore();
    }
});

const setCarPriceFromStore = () => {
    const carData = quotationStore.selectedCar;
    carPrice.value = carData?.price || 0;
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

const formatBaht = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const num = Number(val);
    if (Number.isNaN(num)) return '-';
    return `${num.toLocaleString('th-TH')} ฿`;
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
    font-size: 0.75rem;
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
    font-size: 0.45rem;
    }
}
</style>