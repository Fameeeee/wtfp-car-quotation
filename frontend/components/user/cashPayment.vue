<template>
    <div class="main">
        <div class="special-dis">
            <div class="special-title">ส่วนลดพิเศษ</div>
            <div class="special-details">
                <input type="text" placeholder="ส่วนลดพิเศษ" />
            </div>
        </div>
        <div class="special-plus">
            <div class="special-title">ส่วนเพิ่ม</div>
            <div class="special-details">
                <input type="text" placeholder="ส่วนเพิ่ม" />
            </div>
        </div>
        <div class="total-price">
            <div class="total-title">ราคาสุทธิ</div>
            <div class="total-details">
                <div class="price-box">{{ selectedCar?.price ? Number(selectedCar.price).toLocaleString() : 'N/A' }} บาท
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
const selectedCar = ref({});

onMounted(() => {
    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        selectedCar.value = JSON.parse(storedCar);
    }
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



.special-plus,
.special-dis,
.total-price {
    display: flex;
    width: 100%;
    padding: 10px;
    gap: 10px;
}

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
