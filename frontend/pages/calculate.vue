<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">กรอกข้อมูล</h2>
        <div class="flex space-x-4 mb-6">
            <button @click="selectedPayment = 'cash'"
                :class="{ 'bg-black text-white': selectedPayment === 'cash', 'bg-white text-black border': selectedPayment !== 'cash' }"
                class="px-6 py-2 rounded-lg border transition w-50">
                ราคาซื้อสด
            </button>
            <button @click="selectedPayment = 'installment'"
                :class="{ 'bg-black text-white': selectedPayment === 'installment', 'bg-white text-black border': selectedPayment !== 'installment' }"
                class="px-6 py-2 rounded-lg border transition w-50">
                คำนวณเงินผ่อน
            </button>
        </div>

        <div class="w-full max-w-md">
            <cashPayment v-if="selectedPayment === 'cash'" />
            <installmentPayment v-if="selectedPayment === 'installment'" ref="installmentRef"
                @validity="isInstallmentValid = $event" />
        </div>

        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />

</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
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

let prevPayment = quotationStore.paymentMethod || 'cash';
watch(selectedPayment, (val) => {
    quotationStore.setPaymentMethod(val);
    if (val === 'cash') {
        quotationStore.setInstallmentPlans([]);
    } else if (prevPayment === 'cash' && val === 'installment') {
        // Only clear cashPlan when switching from cash to installment
        quotationStore.setCashPlan({});
    }
    prevPayment = val;
});

const goBack = () => {
    showModal.value = true;
}
const goNext = () => {
    if (selectedPayment.value === 'installment') {
        const ok = installmentRef.value?.validateOnSubmit?.() ?? false;
        if (!ok) return;
        quotationStore.setCashPlan({});
    } else {
        // Cash payment - data is already saved to store by cashPayment.vue watcher
        quotationStore.setInstallmentPlans([]);
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

onMounted(() => {
    if (quotationStore.paymentMethod === 'cash' || quotationStore.paymentMethod === 'installment') {
        selectedPayment.value = quotationStore.paymentMethod;
    } else {
        quotationStore.setPaymentMethod(selectedPayment.value);
    }
});
</script>