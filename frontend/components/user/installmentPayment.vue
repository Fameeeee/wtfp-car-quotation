<template>
    <div class="main">
        <div class="car-price">
            <div class="car-price-title">ราคารถ</div>
            <div class="car-price-details">
                <div class="price-box">{{ selectedCar?.price ? Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท
                </div>
            </div>
        </div>
        <div class="special-dis">
            <div class="special-title">ส่วนลด</div>
            <div class="special-details">
                <input v-model.number="activePlan.specialDiscount" type="number" placeholder="ส่วนลดราคารถ" />
            </div>
        </div>

        <div class="special-plus">
            <div class="special-title">ส่วนเพิ่ม</div>
            <div class="special-details">
                <input v-model.number="activePlan.additionPrice" type="number" placeholder="ส่วนเพิ่มราคารถ" />
            </div>
        </div>

        <div class="total-price">
            <div class="total-title">ราคาสุทธิ</div>
            <div class="total-details">
                <input :value="calculateTotalPrice(activePlan)" type="text" placeholder="ราคาสุทธิ" readonly />
            </div>
        </div>
        <div class="down-payment">
            <div class="down-payment-title">จำนวนเงินดาวน์</div>
            <div class="down-payment-details">
                <input v-model.number="activePlan.downPaymentPercent" type="number" placeholder="%"
                    @input="updateDownPayment" />
                <div class="or">หรือ</div>
                <input v-model.number="activePlan.downPayment" type="number" placeholder="บาท"
                    @input="updateDownPaymentPercent" />
            </div>
        </div>
        <div class="installment-details">
            <div class="grid">
                <div>
                    <p class="label">จำนวนเดือน</p>
                    <div v-for="(period, index) in periods" :key="index" class="box">
                        {{ period }}
                    </div>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="label">อัตราดอกเบี้ย</p>
                    <div v-for="(plan, index) in activePlan.planDetails" :key="index">
                        <input v-model.number="plan.interestRate" type="number" class="input" placeholder="%" />
                    </div>
                </div>
                <div v-if="activePlan?.planDetails?.length">
                    <p class="label">ค่างวดต่อเดือน</p>
                    <div v-for="(installment, index) in calculateMonthlyPayments()" :key="index">
                        <input :value="installment" type="text" class="input" readonly />
                    </div>
                </div>
            </div>
        </div>

        <!-- Display Plan Number -->
        <div class="add-plan-btn">
            <div>เงื่อนไขที่ </div>
            <div v-if="installmentPlans.length > 0" class="plan-navigation">
                <button v-for="(plan, index) in installmentPlans" :key="index" @click="toggleActivePlan(index)"
                    :class="['plan-btn', { 'active': activePlanIndex === index }]">
                    {{ index + 1 }}
                </button>
            </div>
            <button v-if="installmentPlans.length < 3" @click="addPlan" class="add-btn">+</button>
            <button v-if="installmentPlans.length > 1" @click="deleteLastPlan" class="delete-btn"><svg width="24"
                    height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11.9999 9L17.9999 15M17.9999 9L11.9999 15M9.99994 5C9.50302 5.00003 9.02391 5.18504 8.65594 5.519L2.32794 11.259C2.22466 11.3527 2.14213 11.467 2.08565 11.5946C2.02918 11.7221 2 11.86 2 11.9995C2 12.139 2.02918 12.2769 2.08565 12.4044C2.14213 12.532 2.22466 12.6463 2.32794 12.74L8.65594 18.481C9.02391 18.815 9.50302 19 9.99994 19H19.9999C20.5304 19 21.0391 18.7893 21.4142 18.4142C21.7892 18.0391 21.9999 17.5304 21.9999 17V7C21.9999 6.46957 21.7892 5.96086 21.4142 5.58579C21.0391 5.21071 20.5304 5 19.9999 5H9.99994Z"
                        stroke="#E6E6E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
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

</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}

.main {
    width: 80vw;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.car-price,
.special-plus,
.special-dis,
.total-price {
    display: flex;
    width: 100%;
    padding: 10px;
    gap: 10px;
}

.car-price-title,
.special-title,
.total-title {
    font-size: 18px;
    font-weight: bold;
    width: 35%;
}

.down-payment-title {
    font-size: 18px;
    font-weight: bold;
}

input,
select {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.price-box {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    color: #4b5563;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #ccc;
}

.car-price-details,
.special-details,
.total-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 65%;
}

.down-payment,
.installment-details {
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 5px;
}

.down-payment-details {
    display: flex;
    align-items: center;
    gap: 10px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 5px;
}

.label {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
}

.box {
    width: 100%;
    height: 35px;
    border: 1px solid #ddd;
    border-radius: 5px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    margin-bottom: 5px;
}

.input {
    width: 100%;
    height: 35px;
    border: 1px solid #ddd;
    border-radius: 5px;
    text-align: center;
    background: white;
    margin-bottom: 5px;
}

.add-plan-btn {
    margin-top: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.add-btn {
    padding: 10px 20px;
    background-color: #726F6F;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.add-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.plan-navigation {
    display: flex;
    gap: 5px;
}

.plan-btn {
    padding: 10px 20px;
    background-color: white;
    color: black;
    border: 1px solid black;
    border-radius: 5px;
    cursor: pointer;
}

.plan-btn.active {
    background: black;
    color: white;
}

.delete-btn {
    background: #980000;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: flex; 
}
</style>
