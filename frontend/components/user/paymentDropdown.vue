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
                <div v-else class="space-y-6">
                    <!-- Method selector -->
                    <div class="flex space-x-4">
                        <button @click="selectMethod('cash')"
                            :class="{ 'bg-black text-white': selectedMethod === 'cash', 'bg-white text-black border': selectedMethod !== 'cash' }"
                            class="px-6 py-2 rounded-lg border transition">
                            ราคาซื้อสด
                        </button>
                        <button @click="selectMethod('installment')"
                            :class="{ 'bg-black text-white': selectedMethod === 'installment', 'bg-white text-black border': selectedMethod !== 'installment' }"
                            class="px-6 py-2 rounded-lg border transition">
                            คำนวณเงินผ่อน
                        </button>
                    </div>

                    <!-- CASH -->
                    <div v-if="selectedMethod === 'cash'" class="space-y-4">
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                            <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ displayPrice }} บาท
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ส่วนลด</span>
                            <input type="number" v-model.number="cashDiscount" placeholder="ส่วนลดราคารถ"
                                class="w-2/3 p-2 border rounded-lg text-gray-700" />
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ส่วนเพิ่ม</span>
                            <input type="number" v-model.number="cashAddition" placeholder="ส่วนเพิ่มราคารถ"
                                class="w-2/3 p-2 border rounded-lg text-gray-700" />
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ราคาสุทธิ</span>
                            <input type="number" :value="cashTotal" readonly
                                class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
                        </div>
                    </div>

                    <!-- INSTALLMENT -->
                    <div v-if="selectedMethod === 'installment'" class="space-y-4">
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                            <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ displayPrice }} บาท
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ส่วนลด</span>
                            <input type="number" v-model.number="activePlan.specialDiscount" placeholder="ส่วนลดราคารถ"
                                class="w-2/3 p-2 border rounded-lg text-gray-700" />
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ส่วนเพิ่ม</span>
                            <input type="number" v-model.number="activePlan.additionPrice" placeholder="ส่วนเพิ่มราคารถ"
                                class="w-2/3 p-2 border rounded-lg text-gray-700" />
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold w-1/3 text-black">ราคาสุทธิ</span>
                            <input :value="calculateTotalPrice(activePlan)" type="text" readonly
                                class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
                        </div>

                        <div>
                            <span class="font-semibold text-black">จำนวนเงินดาวน์</span>
                            <div class="flex items-center gap-4 mt-2 w-full">
                                <input v-model.number="activePlan.downPaymentPercent" type="number" placeholder="%"
                                    min="0" max="100" @input="updateDownPayment"
                                    class="w-1/2 p-2 border rounded-lg text-black placeholder-gray-400 border-black" />
                                <span class="text-black">หรือ</span>
                                <input v-model.number="downPaymentBaht" type="number" placeholder="บาท"
                                    @input="updateDownPaymentPercent"
                                    class="w-1/2 p-2 border rounded-lg text-black placeholder-gray-400 border-black" />
                            </div>
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
                                    <input v-model="plan.interestRate" @blur="handleInterestRateBlur(plan, index)"
                                        type="number"
                                        class="w-full p-2 border rounded-lg text-center text-black placeholder-gray-400 border-black"
                                        placeholder="%" />
                                </div>
                            </div>
                            <div v-if="activePlan?.planDetails?.length">
                                <p class="text-center font-semibold text-sm text-black">ค่างวดต่อเดือน</p>
                                <div v-for="(installment, index) in calculateMonthlyPayments()" :key="index"
                                    class="mt-2">
                                    <input :value="installment" type="text"
                                        class="w-full p-2 border border-black rounded-lg text-center text-black placeholder-gray-400"
                                        readonly />
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-center gap-4 p-4">
                            <span class="text-black">เงื่อนไขที่ </span>
                            <div v-if="installmentPlans.length > 0" class="flex gap-2">
                                <button v-for="(plan, index) in installmentPlans" :key="index"
                                    @click="toggleActivePlan(index)"
                                    :class="['p-4 border rounded-lg text-black w-[50px]', { 'bg-black text-white w-[50px]': activePlanIndex === index }]">
                                    {{ index + 1 }}
                                </button>
                            </div>
                            <button v-if="installmentPlans.length < 2" @click="addPlan"
                                class="p-4 bg-gray-700 text-white rounded-lg w-[50px]">+</button>
                            <button v-if="installmentPlans.length > 1" @click="deleteLastPlan"
                                class="p-4 bg-red-700 text-white rounded-lg w-[50px]">ลบ</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useApi } from "~/composables/useApi";
import { useQuotationStore } from "~/stores/quotation";
import { useNotification } from '~/composables/useNotification';

const props = defineProps({
    label: String,
    quotationId: [String, Number],
    modelValue: Object,
});

const open = ref(false);
const loading = ref(false);
const selectedMethod = ref(null);
const config = useRuntimeConfig();
const api = useApi();
const store = useQuotationStore();
const toast = useNotification();

const carDetails = reactive({
    price: 0,
});

const cashPlans = ref({});
const cashDiscount = ref(null);
const cashAddition = ref(null);
const initialCashFromApi = ref(null);
const initialInstallmentFromApi = ref([]);
const cashTotal = computed(() => {
    const price = selectedCarPrice.value || 0;
    return Math.ceil(price - (cashDiscount.value || 0) + (cashAddition.value || 0));
});
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

watch(() => props.quotationId, async () => {
    if (!props.quotationId) return;
    await fetchQuotationData();
});

const selectedCarPrice = computed(() => {
    return store.selectedCar?.price || carDetails.price || 0;
});

const displayPrice = computed(() => {
    const p = selectedCarPrice.value;
    return p ? Number(p).toLocaleString() : 'N/A';
});

const fetchQuotationData = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/quotation/${props.quotationId}`);
        const data = response.data.data;

        selectedMethod.value = data.paymentMethod;
        // keep store in sync
        if (typeof store.setPaymentMethod === 'function') store.setPaymentMethod(selectedMethod.value);
        else store.paymentMethod = selectedMethod.value;
        if (data.carDetails?.price) carDetails.price = data.carDetails.price;

        // cache both sets if provided
        if (data.cashPlans) {
            initialCashFromApi.value = { ...data.cashPlans };
        }
        if (data.installmentPlans?.length) {
            initialInstallmentFromApi.value = data.installmentPlans.slice(0, 2).map(inst => ({
                additionPrice: inst.additionPrice ?? null,
                specialDiscount: inst.specialDiscount ?? null,
                downPaymentPercent: inst.downPaymentPercent ?? null,
                planDetails: (inst.planDetails?.length ? inst.planDetails : periods.value.map(period => ({ period, interestRate: null })))
            }));
        }

        if (data.paymentMethod === "cash") {
            if (initialCashFromApi.value) {
                Object.assign(cashPlans.value, initialCashFromApi.value);
                cashDiscount.value = initialCashFromApi.value.specialDiscount ?? null;
                cashAddition.value = initialCashFromApi.value.additionPrice ?? null;
            }
            store.setCashPlan({
                specialDiscount: cashDiscount.value,
                additionPrice: cashAddition.value,
                totalPrice: cashTotal.value
            });
        } else if (data.paymentMethod === "installment") {
            if (initialInstallmentFromApi.value.length) {
                installmentPlans.value = JSON.parse(JSON.stringify(initialInstallmentFromApi.value));
            }
            activePlanIndex.value = 0;
            if (selectedCarPrice.value && activePlan.value?.downPaymentPercent) {
                downPaymentBaht.value = Math.ceil((activePlan.value.downPaymentPercent / 100) * selectedCarPrice.value);
            }
            store.setInstallmentPlans(JSON.parse(JSON.stringify(installmentPlans.value)));
        }

        emit("update", { paymentMethod: selectedMethod.value, installmentPlans: installmentPlans.value, cashPlans: cashPlans.value });
    } catch (err) {
        console.error("Error fetching data", err);
        toast.error('ไม่สามารถโหลดข้อมูลการชำระเงินได้');
    } finally {
        loading.value = false;
    }
};

const toggle = () => {
    open.value = !open.value;
};


const selectMethod = (method) => {
    selectedMethod.value = method;
    // keep store in sync
    if (typeof store.setPaymentMethod === 'function') store.setPaymentMethod(selectedMethod.value);
    else store.paymentMethod = selectedMethod.value;
    
    toast.info(method === 'cash' ? 'เปลี่ยนเป็นชำระเงินสด' : 'เปลี่ยนเป็นชำระเงินผ่อน');
    
    if (method === 'cash') {
        // clear installment
        installmentPlans.value = [];
        store.setInstallmentPlans([]);
        // restore API defaults for cash if available
        if (initialCashFromApi.value) {
            cashDiscount.value = initialCashFromApi.value.specialDiscount ?? null;
            cashAddition.value = initialCashFromApi.value.additionPrice ?? null;
        }
    } else {
        // clear cash
        store.setCashPlan({});
        // restore API defaults for installment if available, else create one plan
        if (initialInstallmentFromApi.value.length) {
            installmentPlans.value = JSON.parse(JSON.stringify(initialInstallmentFromApi.value));
        }
        if (installmentPlans.value.length === 0) {
            installmentPlans.value.push({
                additionPrice: null,
                specialDiscount: null,
                downPaymentPercent: null,
                planDetails: periods.value.map(period => ({ period, interestRate: null })),
            });
        }
        activePlanIndex.value = 0;
        // recalc down payment baht
        if (selectedCarPrice.value && activePlan.value?.downPaymentPercent) {
            downPaymentBaht.value = Math.ceil((activePlan.value.downPaymentPercent / 100) * selectedCarPrice.value);
        } else {
            downPaymentBaht.value = 0;
        }
    }
    // Emit only the relevant payment data to avoid stale fields
    if (selectedMethod.value === 'cash') {
        emit('update', {
            paymentMethod: selectedMethod.value,
            cashPlans: { specialDiscount: cashDiscount.value, additionPrice: cashAddition.value, totalPrice: cashTotal.value },
            installmentPlans: null,
        });
    } else {
        emit('update', {
            paymentMethod: selectedMethod.value,
            installmentPlans: installmentPlans.value,
            cashPlans: null,
        });
    }
};

const updateDownPayment = () => {
    if (!selectedCarPrice.value || !activePlan.value) return;
    downPaymentBaht.value = Math.ceil((activePlan.value.downPaymentPercent / 100) * selectedCarPrice.value);
};

const updateDownPaymentPercent = () => {
    if (!selectedCarPrice.value || !activePlan.value) return;
    activePlan.value.downPaymentPercent = Math.ceil((downPaymentBaht.value / selectedCarPrice.value) * 100);
};

const calculateMonthlyPayments = () => {
    if (!selectedCarPrice.value || !activePlan.value) return [];

    const totalPrice =
        selectedCarPrice.value - (activePlan.value.specialDiscount || 0) + (activePlan.value.additionPrice || 0);

    const loanAmount = totalPrice - (downPaymentBaht.value || 0);

    return activePlan.value.planDetails.map(plan => {
        const months = Number(plan.period || 0);
        if (!months || loanAmount <= 0) return 0;

        const rate = plan.interestRate === null || plan.interestRate === undefined || plan.interestRate === ''
            ? NaN
            : Number(plan.interestRate);
        if (Number.isNaN(rate) || rate <= 0) return 0;

        const monthlyRate = rate / 100 / 12;
        const monthlyPayment =
            loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

        return Math.ceil(monthlyPayment);
    });
};

const handleInterestRateBlur = (plan, index) => {
    const raw = plan.interestRate;
    // Empty input -> null
    if (raw === "" || raw === null || raw === undefined) {
        activePlan.value.planDetails[index].interestRate = null;
        return;
    }
    // Otherwise try to parse number, fallback to null when invalid
    const parsed = Number(String(raw).trim());
    activePlan.value.planDetails[index].interestRate = Number.isNaN(parsed) ? null : parsed;
};

// Calculate total price like installmentPayment.vue
const calculateTotalPrice = (plan) => {
    const discount = plan?.specialDiscount ?? 0;
    const addition = plan?.additionPrice ?? 0;
    return Math.ceil((selectedCarPrice.value || 0) - discount + addition);
};
const addPlan = () => {
    if (installmentPlans.value.length < 2) {
        installmentPlans.value.push({
            additionPrice: null,
            specialDiscount: null,
            downPaymentPercent: null,
            planDetails: periods.value.map(period => ({ period, interestRate: null })),
        });
        activePlanIndex.value = installmentPlans.value.length - 1;
        toast.success('เพิ่มแผนการผ่อนชำระแล้ว');
    } else {
        toast.warning('สามารถเพิ่มได้สูงสุด 2 แผน');
    }
    store.setInstallmentPlans(JSON.parse(JSON.stringify(installmentPlans.value)));
    emit("update", { paymentMethod: selectedMethod.value, installmentPlans: installmentPlans.value });
};

const deleteLastPlan = () => {
    if (installmentPlans.value.length > 1) {
        installmentPlans.value.pop();
        activePlanIndex.value = Math.max(0, activePlanIndex.value - 1);
        toast.info('ลบแผนการผ่อนชำระแล้ว');
    } else {
        toast.warning('ต้องมีอย่างน้อย 1 แผน');
    }
    store.setInstallmentPlans(JSON.parse(JSON.stringify(installmentPlans.value)));
    emit("update", { paymentMethod: selectedMethod.value, installmentPlans: installmentPlans.value });
};

const toggleActivePlan = (index) => {
    activePlanIndex.value = index;
};

// Sync store and emit when cash values change
watch([cashDiscount, cashAddition, cashTotal], () => {
    if (selectedMethod.value !== 'cash') return;
    const plan = {
        specialDiscount: cashDiscount.value,
        additionPrice: cashAddition.value,
        totalPrice: cashTotal.value,
    };
    store.setCashPlan(plan);
    emit("update", { paymentMethod: selectedMethod.value, cashPlans: plan });
});

// Sync store on installment edits
watch(installmentPlans, (newPlans) => {
    if (selectedMethod.value !== 'installment') return;
    store.setInstallmentPlans(JSON.parse(JSON.stringify(newPlans)));
    emit("update", { paymentMethod: selectedMethod.value, installmentPlans: newPlans });
}, { deep: true });

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
