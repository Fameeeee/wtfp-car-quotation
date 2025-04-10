<template>
    <div class="flex flex-col items-center w-full p-4">
        <div class="w-full max-w-md space-y-4">
            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ selectedCar?.price ?
                    Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท</div>
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ส่วนลด</span>
                <input v-model.number="activePlan.specialDiscount" type="number" placeholder="ส่วนลดราคารถ"
                    class="w-2/3 p-2 border rounded-lg text-gray-700 placeholder-gray-400" />
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ส่วนเพิ่ม</span>
                <input v-model.number="activePlan.additionPrice" type="number" placeholder="ส่วนเพิ่มราคารถ"
                    class="w-2/3 p-2 border rounded-lg text-gray-700 placeholder-gray-400" />
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคาสุทธิ</span>
                <input :value="calculateTotalPrice(activePlan)" type="text" placeholder="ราคาสุทธิ" readonly
                    class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
            </div>

            <div>
                <span class="font-semibold text-black">จำนวนเงินดาวน์</span>
                <div class="flex items-center gap-4 mt-2">
                    <input v-model.number="activePlan.downPaymentPercent" type="number" placeholder="%"
                        @input="updateDownPayment"
                        class="w-1/3 p-2 border rounded-lg text-gray-700 placeholder-gray-400" />
                    <span class="text-black">หรือ</span>
                    <input v-model.number="activePlan.downPayment" type="number" placeholder="บาท"
                        @input="updateDownPaymentPercent"
                        class="w-1/3 p-2 border rounded-lg text-gray-700 placeholder-gray-400" />
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <p class="text-center font-bold text-black">จำนวนเดือน</p>
                    <div v-for="(period, index) in periods" :key="index"
                        class="p-2 border border-black rounded-lg text-center text-black bg-gray-100 mt-2">
                        {{ period }}
                    </div>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="text-center font-bold text-black">อัตราดอกเบี้ย</p>
                    <div v-for="(plan, index) in activePlan.planDetails" :key="index" class="mt-2">
                        <input v-model.number="plan.interestRate"
                            @blur="handleInterestRateBlur(plan, index)"
                            type="number"
                            class="w-full p-2 border border-black rounded-lg text-center text-black placeholder-gray-400"
                            placeholder="%" />
                    </div>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="text-center font-bold text-black">ค่างวดต่อเดือน</p>
                    <div v-for="(installment, index) in calculateMonthlyPayments()" :key="index" class="mt-2">
                        <input :value="installment" type="text"
                            class="w-full p-2 border border-black rounded-lg text-center text-black bg-gray-100"
                            readonly />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center gap-4 p-4">
                <span class="text-black">เงื่อนไขที่ </span>
                <div v-if="installmentPlans.length > 0" class="flex gap-2">
                    <button v-for="(plan, index) in installmentPlans" :key="index" @click="toggleActivePlan(index)"
                        :class="['p-4 border rounded-lg text-black 2-[50px]', { 'bg-black text-white w-[50px]': activePlanIndex === index }]">
                        {{ index + 1 }}
                    </button>
                </div>
                <button v-if="installmentPlans.length < 3" @click="addPlan"
                    class="p-4 bg-gray-700 text-white rounded-lg w-[50px]">+</button>
                <button v-if="installmentPlans.length > 1" @click="deleteLastPlan"
                    class="p-4 bg-red-700 text-white rounded-lg">
                    ลบ
                </button>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const periods = ref([36, 48, 60, 72, 84]);
const selectedCar = ref({});
const installmentPlans = ref([]);
const activePlanIndex = ref(0);

const activePlan = computed(() => installmentPlans.value[activePlanIndex.value] || {});

onMounted(() => {
    const storedPlans = localStorage.getItem('installmentPlans');
    if (storedPlans) {
        installmentPlans.value = JSON.parse(storedPlans);
    }

    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        selectedCar.value = JSON.parse(storedCar);
    }

    if (installmentPlans.value.length === 0) {
        addPlan();
    }
});

watch(installmentPlans, (newPlans) => {
    localStorage.setItem('installmentPlans', JSON.stringify(newPlans));
}, { deep: true });

const addPlan = () => {
    if (installmentPlans.value.length < 3) {
        installmentPlans.value.push({
            orderNumber: installmentPlans.value.length + 1,
            specialDiscount: null,
            additionPrice: null,
            downPaymentPercent: null,
            downPayment: null,
            planDetails: periods.value.map(period => ({ period, interestRate: null }))
        });
    }
};

const deleteLastPlan = () => {
    if (installmentPlans.value.length > 0) {
        installmentPlans.value.pop();
    }
};

const toggleActivePlan = (index) => {
    activePlanIndex.value = index;
};

const calculateTotalPrice = (plan) => {
    return Math.ceil((selectedCar.value.price || 0) - plan.specialDiscount + plan.additionPrice);
};

const updateDownPayment = () => {
    const active = activePlan.value;
    active.downPaymentPercent = Math.ceil(active.downPaymentPercent);
    active.downPayment = Math.ceil((active.downPaymentPercent / 100) * calculateTotalPrice(active));
};

const updateDownPaymentPercent = () => {
    const active = activePlan.value;
    active.downPaymentPercent = Math.ceil((active.downPayment / calculateTotalPrice(active)) * 100);
};

const calculateMonthlyPayments = () => {
    return activePlan.value.planDetails?.map(plan => {
        const loanAmount = calculateTotalPrice(activePlan.value) - activePlan.value.downPayment;
        const months = plan.period;

        if (plan.interestRate === 0) {
            return Math.ceil(loanAmount / months);
        }

        if (!plan.interestRate || plan.interestRate < 0) return 0;

        const monthlyRate = (plan.interestRate / 100) / 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

        return Math.ceil(monthlyPayment);
    }) || [];
};

const handleInterestRateBlur = (plan, index) => {
    if (plan.interestRate === '') {
        plan.interestRate = null;  
    }
};
</script>
