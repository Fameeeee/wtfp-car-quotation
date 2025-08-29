<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">กรอกข้อมูล</h2>
        <div class="flex space-x-4 mb-6">
            <button @click="selectedPayment = 'cash'"
                :class="{ 'bg-black text-white': selectedPayment === 'cash', 'bg-white text-black border': selectedPayment !== 'cash' }"
                class="px-6 py-2 rounded-lg border transition">
                ราคาซื้อสด
            </button>
            <button @click="selectedPayment = 'installment'"
                :class="{ 'bg-black text-white': selectedPayment === 'installment', 'bg-white text-black border': selectedPayment !== 'installment' }"
                class="px-6 py-2 rounded-lg border transition">
                คำนวณเงินผ่อน
            </button>
        </div>

        <div class="w-full max-w-md">
            <cashPayment v-if="selectedPayment === 'cash'" />
            <installmentPayment v-if="selectedPayment === 'installment'" ref="installmentRef" @validity="isInstallmentValid = $event" />
        </div>

    <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />

</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';
import { useQuotationStore } from '~/stores/quotation';

const router = useRouter();
const quotationStore = useQuotationStore();
const selectedPayment = ref('cash');
const showModal = ref(false);
const isInstallmentValid = ref(false);
const installmentRef = ref(null);

// keep store in sync when user toggles between cash/installment
watch(selectedPayment, (val) => {
    quotationStore.setPaymentMethod(val);
    if (val === 'cash') {
        quotationStore.setInstallmentPlans([]);
    } else {
        quotationStore.setCashPlan({});
    }
});

const goBack = () => {
    showModal.value = true;
}
const goNext = () => {
    if (selectedPayment.value === 'installment') {
        // Trigger child validation on submit
        const ok = installmentRef.value?.validateOnSubmit?.() ?? false;
        if (!ok) return;
    }
    if (selectedPayment.value === 'cash') {
        quotationStore.setInstallmentPlans([]);
    } else {
        quotationStore.setCashPlan({});
    }
    quotationStore.setPaymentMethod(selectedPayment.value);
    router.push('/select-accessories');
};
const closeModal = () => showModal.value = false;
const discardChanges = () => {
    showModal.value = false;
    quotationStore.setCashPlan({});
    quotationStore.setInstallmentPlans([]);
    router.push('/confirm-car');
};

definePageMeta({ middleware: 'staff-auth' });

// initialize from store if present, else set default
onMounted(() => {
    if (quotationStore.paymentMethod === 'cash' || quotationStore.paymentMethod === 'installment') {
        selectedPayment.value = quotationStore.paymentMethod;
    } else {
        quotationStore.setPaymentMethod(selectedPayment.value);
    }
});
</script>