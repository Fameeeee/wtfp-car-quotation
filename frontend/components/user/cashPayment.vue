<template>
    <div class="flex flex-col items-center w-full p-4">
        <div class="w-full max-w-md space-y-4">
            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                <ClientOnly>
                    <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ selectedCar?.price ? Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท</div>
                    <template #fallback>
                        <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">N/A บาท</div>
                    </template>
                </ClientOnly>
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ส่วนลด</span>
                <input type="number" v-model.number="specialDiscount" placeholder="ส่วนลดราคารถ" 
                    class="w-2/3 p-2 border rounded-lg text-gray-700" />
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ส่วนเพิ่ม</span>
                <input type="number" v-model.number="specialAddition" placeholder="ส่วนเพิ่มราคารถ" 
                    class="w-2/3 p-2 border rounded-lg text-gray-700" />
            </div>

            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคาสุทธิ</span>
                <ClientOnly>
                    <input type="number" :value="totalPrice" placeholder="ราคาสุทธิ" readonly 
                        class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
                    <template #fallback>
                        <input type="number" value="" placeholder="ราคาสุทธิ" readonly 
                            class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
                    </template>
                </ClientOnly>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useQuotationStore } from '~/stores/quotation';

const quotationStore = useQuotationStore();
const selectedCar = computed(() => quotationStore.selectedCar);
const specialDiscount = ref(0);
const specialAddition = ref(0);

const totalPrice = computed(() => {
    return (selectedCar.value?.price || 0) - (specialDiscount.value || 0) + (specialAddition.value || 0);
});


onMounted(() => {
    if (quotationStore.cashPlan) {
        specialDiscount.value =
            typeof quotationStore.cashPlan.specialDiscount === 'number'
                ? quotationStore.cashPlan.specialDiscount
                : 0;
        specialAddition.value =
            typeof quotationStore.cashPlan.specialAddition === 'number'
                ? quotationStore.cashPlan.specialAddition
                : 0;
    }
});

watch([specialDiscount, specialAddition, totalPrice], () => {
    const discount = Number.isFinite(Number(specialDiscount.value)) ? Number(specialDiscount.value) : 0;
    const addition = Number.isFinite(Number(specialAddition.value)) ? Number(specialAddition.value) : 0;
    const total = Number.isFinite(Number(totalPrice.value)) ? Number(totalPrice.value) : 0;
    const cashPlan = {
        specialDiscount: discount,
        specialAddition: addition,
        totalPrice: total
    };
    quotationStore.setCashPlan(cashPlan);
});
</script>
