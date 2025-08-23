<template>
    <div class="w-full border border-black rounded-md font-semibold">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 gap-2 cursor-pointer" @click="toggle">
            <div>{{ label }}</div>
            <svg :class="{ 'rotate-180': open }" class="transition-transform duration-300" width="35" height="35"
                viewBox="0 0 35 35" fill="none">
                <path d="M10.2083 14.5833L17.4999 21.8749L24.7916 14.5833" stroke="black" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

        <!-- Content -->
        <transition name="slide-fade">
            <div v-if="open" class="p-6 border-t border-black space-y-6 bg-white rounded-lg shadow-md">
                <div v-if="loading">Loading...</div>
                <div v-else>
                    <!-- CASH -->
                    <div v-if="selectedMethod === 'cash'">
                        <div class="p-2 flex flex-col gap-2">
                            <label class="block text-black text-sm">ราคาสุทธิ</label>
                            <input type="number" :value="cashPlans.totalPrice" disabled
                                class="w-full bg-gray-100 border border-gray-400 rounded p-2" />
                        </div>
                        <div class="p-2 flex flex-col gap-2">
                            <label class="block text-black text-sm">ส่วนลด</label>
                            <input type="number" v-model="cashPlans.specialDiscount"
                                class="w-full border border-gray-400 rounded p-2" placeholder="กรอกส่วนลด" />
                        </div>
                        <div class="p-2 flex flex-col gap-2">
                            <label class="block text-black text-sm">ส่วนเพิ่ม</label>
                            <input type="number" v-model="cashPlans.specialAddition"
                                class="w-full border border-gray-400 rounded p-2" placeholder="กรอกส่วนเพิ่ม" />
                        </div>
                    </div>

                    <!-- INSTALLMENT -->
                    <div v-if="selectedMethod === 'installment'">
                        <!-- switch between multiple plans -->


                        <!-- Active Plan -->
                        <div v-if="activePlan">
                            <div class="p-2 flex flex-col gap-2">
                                <label class="block text-black text-sm">ส่วนลด</label>
                                <input type="number" v-model="activePlan.specialDiscount"
                                    class="w-full border border-gray-400 rounded p-2" placeholder="กรอกส่วนลด" />
                            </div>

                            <div class="p-2 flex flex-col gap-2">
                                <label class="block text-black text-sm">ส่วนเพิ่ม</label>
                                <input type="number" v-model="activePlan.additionPrice"
                                    class="w-full border border-gray-400 rounded p-2" placeholder="กรอกส่วนเพิ่ม" />
                            </div>

                            <div class="p-2 flex flex-col gap-2">
                                <span class="block text-black text-sm">จำนวนเงินดาวน์</span>
                                <div class="flex items-center gap-4">
                                    <input v-model.number="activePlan.downPaymentPercent" type="number" placeholder="%"
                                        @input="updateDownPayment" class="w-2/4 border border-gray-400 rounded p-2" />
                                    <span class="text-black">หรือ</span>
                                    <input v-model.number="downPaymentBaht" type="number" placeholder="บาท"
                                        @input="updateDownPaymentPercent"
                                        class="w-2/4 border border-gray-400 rounded p-2" />
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-2 p-2">
                                <!-- Periods -->
                                <div>
                                    <p class="text-center font-semibold text-black text-sm">จำนวนเดือน</p>
                                    <div v-for="(period, index) in periods" :key="index"
                                        class="p-2 border border-gray-400 rounded text-center text-black bg-gray-100 mt-2">
                                        {{ period }}
                                    </div>
                                </div>

                                <!-- Interest Rates -->
                                <div v-if="activePlan?.planDetails?.length">
                                    <p class="text-center font-semibold text-black text-sm">อัตราดอกเบี้ย</p>
                                    <div v-for="(plan, index) in activePlan.planDetails" :key="index" class="mt-2">
                                        <input v-model.number="plan.interestRate"
                                            @blur="handleInterestRateBlur(plan, index)" type="number"
                                            class="w-full p-2 border border-gray-400 rounded text-center text-black placeholder-gray-400"
                                            placeholder="%" />
                                    </div>
                                </div>

                                <!-- Monthly Payments -->
                                <div v-if="activePlan?.planDetails?.length">
                                    <p class="text-center font-semibold text-black text-sm">ค่างวดต่อเดือน</p>
                                    <div v-for="(installment, index) in calculateMonthlyPayments()" :key="index"
                                        class="mt-2">
                                        <input :value="installment" type="number"
                                            class="w-full p-2 border border-gray-400 rounded text-center text-black placeholder-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center justify-center gap-4 p-4">
                                <span class="text-black text-sm">เงื่อนไขที่ </span>
                                <div v-if="installmentPlans.length > 0" class="flex gap-2">
                                    <button v-for="(plan, index) in installmentPlans" :key="index"
                                        @click="toggleActivePlan(index)" :class="['p-4 border rounded-lg text-black w-[50px]',
                                            { 'bg-black text-white': activePlanIndex === index }]">
                                        {{ index + 1 }}
                                    </button>
                                </div>
                                <button v-if="installmentPlans.length < 3" @click="addPlan"
                                    class="p-4 bg-gray-700 text-white rounded-lg w-[50px]">+
                                </button>
                                <button v-if="installmentPlans.length > 1" @click="deleteLastPlan"
                                    class="p-4 bg-red-700 text-white rounded-lg">ลบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import axios from "axios";

const props = defineProps({
    label: String,
    quotationId: [String, Number],
    modelValue: Object,
});

const open = ref(false);
const loading = ref(false);
const selectedMethod = ref(null);
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const carDetails = reactive({
    price: 0,
});

const cashPlans = ref({});
const installmentPlans = ref([]);
const activePlanIndex = ref(0);
const activePlan = computed(() => installmentPlans.value[activePlanIndex.value] || null);


const downPaymentBaht = ref(0);
const periods = ref([36, 48, 60, 72, 84]);

const emit = defineEmits(['update']);

onMounted(async () => {
    if (!props.quotationId) return;
    await fetchQuotationData();
});

// Or fetch again if quotationId changes
watch(() => props.quotationId, async () => {
    if (!props.quotationId) return;
    await fetchQuotationData();
});

const fetchQuotationData = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${backendUrl}/quotation/${props.quotationId}`);
        const data = response.data;

        selectedMethod.value = data.paymentMethod;
        if (data.carDetails?.price) carDetails.price = data.carDetails.price;

        if (data.paymentMethod === "cash" && data.cashPlans) {
            Object.assign(cashPlans.value, data.cashPlans);
        } else if (data.paymentMethod === "installment" && data.installmentPlans?.length) {
            installmentPlans.value = data.installmentPlans.map(inst => ({
                additionPrice: inst.additionPrice,
                specialDiscount: inst.specialDiscount,
                downPaymentPercent: inst.downPaymentPercent || 0,
                planDetails: inst.planDetails?.length
                    ? inst.planDetails
                    : periods.value.map(p => ({ period: p, interestRate: null })),
            }));
            activePlanIndex.value = 0;
            if (carDetails.price && activePlan.value?.downPaymentPercent) {
                downPaymentBaht.value = Math.ceil((activePlan.value.downPaymentPercent / 100) * carDetails.price);
            }
        }

        // Emit initial data to parent
        emit("update", {
            paymentMethod: selectedMethod.value,
            installmentPlans: installmentPlans.value
        });
    } catch (err) {
        console.error("Error fetching data", err);
    } finally {
        loading.value = false;
    }
};

const toggle = () => {
    open.value = !open.value;
};


const updateDownPayment = () => {
    if (!carDetails.price || !activePlan.value) return;
    downPaymentBaht.value = Math.ceil((activePlan.value.downPaymentPercent / 100) * carDetails.price);
};

const updateDownPaymentPercent = () => {
    if (!carDetails.price || !activePlan.value) return;
    activePlan.value.downPaymentPercent = Math.ceil((downPaymentBaht.value / carDetails.price) * 100);
};

const calculateMonthlyPayments = () => {
    if (!carDetails.price || !activePlan.value) return [];

    const totalPrice =
        carDetails.price - (activePlan.value.specialDiscount || 0) + (activePlan.value.additionPrice || 0);

    const loanAmount = totalPrice - (downPaymentBaht.value || 0);

    return activePlan.value.planDetails.map(plan => {
        const months = plan.period;
        if (!months || loanAmount <= 0) return 0;
        if (!plan.interestRate || plan.interestRate <= 0) return 0;

        const monthlyRate = plan.interestRate / 100 / 12;
        const monthlyPayment =
            loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

        return Math.ceil(monthlyPayment);
    });
};

const handleInterestRateBlur = (plan, index) => {
    if (plan.interestRate === "" || plan.interestRate === null) {
        activePlan.value.planDetails[index].interestRate = null;
    }
};
const addPlan = () => {
    if (installmentPlans.value.length < 3) {
        installmentPlans.value.push({
            additionPrice: null,
            specialDiscount: null,
            downPaymentPercent: null,
            planDetails: periods.value.map(period => ({ period, interestRate: null })),
        });
        activePlanIndex.value = installmentPlans.value.length - 1;
    }
};

const deleteLastPlan = () => {
    if (installmentPlans.value.length > 1) {
        installmentPlans.value.pop();
        activePlanIndex.value = Math.max(0, activePlanIndex.value - 1);
    }
};

const toggleActivePlan = (index) => {
    activePlanIndex.value = index;
};

</script>


<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
}
</style>
