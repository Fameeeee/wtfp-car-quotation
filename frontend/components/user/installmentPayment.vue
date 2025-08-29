<template>
    <div class="flex flex-col items-center w-full p-4">
        <div class="w-full max-w-md space-y-4">
            <!-- Validation summary (only after confirm click) -->
            <div v-if="showErrors && (errors.downPayment || errors.interestRates)" class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                <ul class="list-disc pl-5 space-y-1">
                    <li v-if="errors.downPayment">{{ errors.downPayment }}</li>
                    <li v-if="errors.interestRates">{{ errors.interestRates }}</li>
                </ul>
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                <ClientOnly>
                    <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ selectedCar?.price ?
                        Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท</div>
                    <template #fallback>
                        <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">N/A บาท</div>
                    </template>
                </ClientOnly>
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
                <div class="flex items-center gap-4 mt-2 w-full">
                    <input v-model.number="activePlan.downPaymentPercent" type="number" placeholder="%" min="0" max="100"
                        @input="updateDownPayment"
                        :class="['w-1/2 p-2 border rounded-lg text-black placeholder-gray-400', showErrors && errors.downPayment ? 'border-red-500 focus:ring-red-500' : 'border-black']" />
                    <span class="text-black">หรือ</span>
                    <input v-model.number="activePlan.downPayment" type="number" placeholder="บาท"
                        @input="updateDownPaymentPercent"
                        :class="['w-1/2 p-2 border rounded-lg text-black placeholder-gray-400', showErrors && errors.downPayment ? 'border-red-500 focus:ring-red-500' : 'border-black']" />
                </div>
                <p v-if="showErrors && errors.downPayment" class="mt-1 text-sm text-red-600">{{ errors.downPayment }}</p>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <p class="text-center font-semibold text-sm text-black">จำนวนเดือน</p>
                    <div v-for="(period, index) in periods" :key="index"
                        class="p-2 border border-black rounded-lg text-center text-black bg-gray-100 mt-2">
                        {{ period }}
                    </div>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="text-center font-semibold text-sm text-black">อัตราดอกเบี้ย</p>
                    <div v-for="(plan, index) in activePlan.planDetails" :key="index" class="mt-2">
                        <input v-model.number="plan.interestRate"
                            @blur="handleInterestRateBlur(plan, index)"
                            type="number"
                            :class="['w-full p-2 border rounded-lg text-center text-black placeholder-gray-400', (showErrors && errors.interestRates && isInterestRateEmpty(plan.interestRate)) ? 'border-red-500 focus:ring-red-500' : 'border-black']"
                            placeholder="%" />
                    </div>
                    <p v-if="showErrors && errors.interestRates" class="mt-2 text-center text-sm text-red-600">{{ errors.interestRates }}</p>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="text-center font-semibold text-sm text-black">ค่างวดต่อเดือน</p>
                    <div v-for="(installment, index) in calculateMonthlyPayments()" :key="index" class="mt-2">
                        <input :value="installment" type="text"
                            class="w-full p-2 border border-black rounded-lg text-center text-black placeholder-gray-400"
                            readonly />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center gap-4 p-4">
                <span class="text-black">เงื่อนไขที่ </span>
                <div v-if="installmentPlans.length > 0" class="flex gap-2">
                    <button v-for="(plan, index) in installmentPlans" :key="index" @click="toggleActivePlan(index)"
                        :class="['p-4 border rounded-lg text-black w-[50px]', { 'bg-black text-white w-[50px]': activePlanIndex === index }]">
                        {{ index + 1 }}
                    </button>
                </div>
                <button v-if="installmentPlans.length < 2" @click="addPlan"
                    class="p-4 bg-gray-700 text-white rounded-lg w-[50px]">+</button>
                <button v-if="installmentPlans.length > 1" @click="deleteLastPlan"
                    class="p-4 bg-red-700 text-white rounded-lg w-[50px]">
                    ลบ
                </button>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuotationStore } from '~/stores/quotation';

const emit = defineEmits(['validity']);

const periods = ref([36, 48, 60, 72, 84]);
const quotationStore = useQuotationStore();
const selectedCar = computed(() => quotationStore.selectedCar);
const installmentPlans = ref([]);
const activePlanIndex = ref(0);

const activePlan = computed(() => installmentPlans.value[activePlanIndex.value] || {});

// Validation state
const errors = ref({ downPayment: '', interestRates: '' });
const showErrors = ref(false);

const isInterestRateEmpty = (val) => (val === null || val === '' || typeof val === 'undefined');

const validate = () => {
    const e = {};
    // Require downPayment (either amount or percent)
    const dp = activePlan.value?.downPayment;
    const dpPct = activePlan.value?.downPaymentPercent;
    if ((dp == null || dp === '' || isNaN(dp)) && (dpPct == null || dpPct === '' || isNaN(dpPct))) {
        e.downPayment = 'กรุณากรอก จำนวนเงินดาวน์ หรือ เปอร์เซ็นต์เงินดาวน์';
    }

    // Require at least one interest rate to be filled (0 allowed)
    const details = activePlan.value?.planDetails || [];
    const allEmpty = details.length > 0 && details.every((d) => isInterestRateEmpty(d.interestRate));
    if (allEmpty) {
        e.interestRates = 'กรุณากรอก อัตราดอกเบี้ย อย่างน้อย 1 งวด';
    }

    errors.value = e;
    return Object.keys(e).length === 0;
};

// Expose a method for parent to trigger validation on submit
const validateOnSubmit = () => {
    showErrors.value = true;
    const ok = validate();
    emit('validity', ok);
    return ok;
};
defineExpose({ validateOnSubmit });

onMounted(() => {
    if (quotationStore.installmentPlans && quotationStore.installmentPlans.length > 0) {
        // cap to 2 plans max
        const capped = JSON.parse(JSON.stringify(quotationStore.installmentPlans)).slice(0, 2);
        installmentPlans.value = capped;
        if (quotationStore.installmentPlans.length > 2) {
            quotationStore.setInstallmentPlans(capped);
        }
    }
    if (installmentPlans.value.length === 0) {
        addPlan();
    }
    // Precompute errors (hidden until showErrors)
    validate();
});

watch(installmentPlans, (newPlans) => {
    quotationStore.setInstallmentPlans(JSON.parse(JSON.stringify(newPlans)));
    validate();
}, { deep: true });

watch(activePlanIndex, () => {
    // Revalidate when switching plans
    validate();
});

const addPlan = () => {
    if (installmentPlans.value.length < 2) {
        installmentPlans.value.push({
            orderNumber: installmentPlans.value.length + 1,
            specialDiscount: null,
            additionPrice: null,
            downPaymentPercent: null,
            downPayment: null,
            planDetails: periods.value.map(period => ({ period, interestRate: null }))
        });
    }
    validate();
};

const deleteLastPlan = () => {
    if (installmentPlans.value.length > 0) {
        installmentPlans.value.pop();
    }
    validate();
};

const toggleActivePlan = (index) => {
    activePlanIndex.value = index;
    validate();
};

const calculateTotalPrice = (plan) => {
    // Default discount/addition to 0 if not filled
    const discount = plan.specialDiscount ?? 0;
    const addition = plan.additionPrice ?? 0;
    return Math.ceil((selectedCar.value.price || 0) - discount + addition);
};

const updateDownPayment = () => {
    const active = activePlan.value;
    // Default percent to 0 if not filled, clamp to [0, 100]
    let percent = active.downPaymentPercent ?? 0;
    percent = Math.min(100, Math.max(0, percent));
    active.downPaymentPercent = Math.ceil(percent);
    const total = calculateTotalPrice(active);
    active.downPayment = Math.ceil((active.downPaymentPercent / 100) * total);
    validate();
};

const updateDownPaymentPercent = () => {
    const active = activePlan.value;
    // Default downPayment to 0 if not filled
    let down = active.downPayment ?? 0;
    const total = calculateTotalPrice(active);
    // Clamp down to [0, total]
    down = Math.min(Math.max(0, down), total);
    active.downPayment = Math.ceil(down);
    let pct = (down / (total || 1)) * 100;
    pct = Math.min(100, Math.max(0, pct));
    active.downPaymentPercent = Math.ceil(pct);
    validate();
};

const calculateMonthlyPayments = () => {
    return activePlan.value.planDetails?.map(plan => {
        // If down payment not provided at all, leave blank
        const hasDownPayment = !(activePlan.value.downPayment == null && activePlan.value.downPaymentPercent == null);
        if (!hasDownPayment) return '';

        // If interest rate empty for this row, leave blank
        if (isInterestRateEmpty(plan.interestRate)) return '';

        const downPayment = activePlan.value.downPayment ?? 0;
        const loanAmount = calculateTotalPrice(activePlan.value) - downPayment;
        const months = plan.period;
        const interestRate = plan.interestRate ?? 0;

        if (interestRate === 0) {
            return Math.ceil(loanAmount / months);
        }
        if (interestRate < 0) return '';

        const monthlyRate = (interestRate / 100) / 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return Math.ceil(monthlyPayment);
    }) || [];
};

const handleInterestRateBlur = (plan, index) => {
    if (plan.interestRate === '') {
        plan.interestRate = null;  
    }
    validate();
};

// No additional mounted hook needed
</script>
