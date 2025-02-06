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
    min-height: 100%;
    padding: 2rem;
    background-color: #f4f7fc;
}

.card {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 480px;
    padding: 2rem;
    margin-top: 2rem;
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
}

.card-title {
    text-align: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 1.875rem;
    font-weight: 600;
    color: #333;
    line-height: 1.2;
}

.card-body {
    text-align: left;
    margin-bottom: 2rem;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.info p {
    font-size: 1.125rem;
    line-height: 1.6;
    color: #4b5563;
    padding: 0.75rem;
    background-color: #f9fafb;
    border-radius: 8px;
    transition: background-color 0.2s ease;
}

.info p:hover {
    background-color: #f3f4f6;
}

.info strong {
    color: #1f2937;
    font-weight: 600;
    margin-right: 0.5rem;
}

.btn {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

.confirm-btn {
    flex: 2;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #980000 0%, #980000 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.confirm-btn:hover {
    background: linear-gradient(135deg, #980000 0%, #980000 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.confirm-btn:active {
    transform: translateY(0);
}

.back-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-btn:hover {
    background-color: #e5e7eb;
    color: #374151;
}

@media (max-width: 640px) {
    .container {
        padding: 1rem;
    }

    .card {
        padding: 1.5rem;
        margin-top: 1rem;
    }

    .btn {
        flex-direction: column-reverse;
    }

    .confirm-btn,
    .back-btn {
        width: 100%;
    }

    .title {
        font-size: 1.5rem;
    }

    .info p {
        font-size: 1rem;
    }
}

strong {
    color: #333;
}
</style>
