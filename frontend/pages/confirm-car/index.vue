<template>
    <div class="container">
        <div class="card">
            <div class="card-title">
                <h2 class="title">Confirm Your Selection</h2>
            </div>
            <div class="card-body">
                <div class="info">
                    <p><strong>Unit Type:</strong> {{ selectedCar.unitType }}</p>
                    <p><strong>Model Class:</strong> {{ selectedCar.modelClass }}</p>
                    <p><strong>Model Code Name:</strong> {{ selectedCar.modelCodeName }}</p>
                    <p><strong>Model Gname:</strong> {{ selectedCar.modelGname }}</p>
                    <p><strong>Price:</strong> {{ selectedCar.price }}</p>
                    <p><strong>Color:</strong> {{ selectedCar.color }}</p>
                </div>
            </div>
            <div class="btn">
                <button @click="confirmSelection" class="confirm-btn">Confirm</button>
                <button @click="goBack" class="back-btn">Back</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const router = useRouter();
const selectedCar = ref({});

onMounted(() => {
    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        selectedCar.value = JSON.parse(storedCar)
    }
})

const confirmSelection = () => {
    router.push('/select-accessories')
};

const goBack = () => {
    localStorage.removeItem('selectedCar')
    router.push('/select')
}

definePageMeta({
    middleware: 'staff-auth'
})
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
}

body {
    background-color: #f4f7fc;
}

.container {
    display: flex;
    justify-content: center;
}

.card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 400px;
    padding: 20px;
    text-align: center;
    box-sizing: border-box;
    margin-top: 10px;
}

.card-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    background: #ffff;
}

.title {
    font-size: 1.8rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
}

.back-btn {
    background: #ffff;
    border: none;
    color: #4c6ef5;
    font-size: 16px;
    cursor: pointer;
    margin-top: 10px;
}

.back-btn:hover {
    color: #1a4bdb;
}

.card-body {
    text-align: left;
    margin-bottom: 20px;
}

.card-body p {
    font-size: 1.2rem;
    line-height: 1.6;
    color: #666;
    margin: 10px 0;
}

.card-footer {
    display: flex;
    justify-content: center;
}

.confirm-btn {
    background-color: #4c6ef5;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
}

.confirm-btn:hover {
    background-color: #1a4bdb;
}

.confirm-btn:active {
    background-color: #1a4bdb;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

strong {
    color: #333;
}
</style>
