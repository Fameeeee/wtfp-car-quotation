<template>
    <div class="flex flex-col items-center w-full p-4">
        <div class="w-full max-w-md space-y-4">
            <div class="flex items-center gap-4">
                <span class="font-semibold w-1/3 text-black">ราคารถ</span>
                <div class="w-2/3 p-2 bg-gray-100 border rounded-lg text-gray-700">{{ selectedCar?.price ? Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท</div>
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
                <input type="number" v-model="totalPrice" placeholder="ราคาสุทธิ" readonly 
                    class="w-2/3 p-2 border rounded-lg text-gray-700 bg-gray-100" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const selectedCar = ref({});
const specialDiscount = ref(null);
const specialAddition = ref(null);

const totalPrice = computed(() => {
    return (selectedCar.value?.price || 0) - (specialDiscount.value || 0) + (specialAddition.value || 0);
});

onMounted(() => {
    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        selectedCar.value = JSON.parse(storedCar);
    }
});

watch([specialDiscount, specialAddition, totalPrice], () => {
    const cashPlan = {
        carPrice: selectedCar.value?.price || 0,
        specialDiscount: specialDiscount.value,
        specialAddition: specialAddition.value,
        totalPrice: totalPrice.value
    };
    localStorage.setItem('cashPlan', JSON.stringify(cashPlan));
});
</script>
