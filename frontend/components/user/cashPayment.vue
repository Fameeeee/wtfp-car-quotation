<template>
    <div class="main">
        <div class="car-price">
            <div class="car-price-title">ราคารถ</div>
            <div class="car-price-details">
                <div class="price-box">{{ selectedCar?.price ? Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท</div>
            </div>
        </div>
        <div class="special-dis">
            <div class="special-title">ส่วนลด</div>
            <div class="special-details">
                <input type="number" v-model.number="specialDiscount" placeholder="ส่วนลดราคารถ" />
            </div>
        </div>
        <div class="special-plus">
            <div class="special-title">ส่วนเพิ่ม</div>
            <div class="special-details">
                <input type="number" v-model.number="specialAddition" placeholder="ส่วนเพิ่มราคารถ" />
            </div>
        </div>
        <div class="total-price">
            <div class="total-title">ราคาสุทธิ</div>
            <div class="total-details">
                <input type="number" v-model="totalPrice" placeholder="ราคาสุทธิ" readonly />
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
        specialAddition: specialAddition.value ,
        totalPrice: totalPrice.value
    };
    localStorage.setItem('cashPlan', JSON.stringify(cashPlan));
});
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

input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
}


</style>
