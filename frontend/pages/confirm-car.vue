<template>
    <div class="container">
        <div class="card">
            <div class="card-title">
                <h2 class="title">ยืนยันรายการที่เลือก</h2>
            </div>
            <div class="card-body">
                <div class="info">
                    <p><strong>Unit Type :</strong> {{ selectedCar.unitType }}</p>
                    <p><strong>Model Class :</strong> {{ selectedCar.modelClass }}</p>
                    <p><strong>Model Code Name :</strong> {{ selectedCar.modelCodeName }}</p>
                    <p><strong>Model G name :</strong> {{ selectedCar.modelGname }}</p>
                    <p><strong>Price :</strong> {{ selectedCar.price }}</p>
                    <p><strong>Color :</strong> {{ selectedCar.color }}</p>
                </div>
            </div>
            <div class="btn">
                <button @click="confirmSelection" class="confirm-btn">ยืนยัน</button>
                <button @click="goBack" class="back-btn">กลับ</button>
            </div>
        </div>
    </div>
    <div v-if="showModal" class="modal-overlay">
        <div class="modal">
            <p class="modal-text">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="modal-btn">
                <button @click="discardChanges" class="confirm-btn">ยืนยัน</button>
                <button @click="closeModal" class="back-btn">กลับ</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const selectedCar = ref({});
const showModal = ref(false);
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

onMounted(async () => {
    const storedCar = localStorage.getItem('selectedCar');
    if (storedCar) {
        selectedCar.value = JSON.parse(storedCar);
        if (!selectedCar.value.id) {
            await fetchUnitId(selectedCar.value.unitType);
        }
    }
});
const fetchUnitId = async (unitType) => {
    try {
        const response = await axios.get(`${apiUrl}/standard-base?filter=unitType||$eq||${unitType}&filter=status||$eq||1`);
        if (response.data && response.data.length > 0) {
            selectedCar.value = { ...selectedCar.value, id: response.data[0].id };
            localStorage.setItem('selectedCar', JSON.stringify(selectedCar.value));
        }
    } catch (error) {
        console.error('Error fetching unit ID:', error);
    }
};

const confirmSelection = async () => {
    try {
        router.push('/select-accessories');
    } catch (error) {
        console.error('Error confirming selection:', error);
    }
};

const goBack = async () => {
    if (selectedCar.value) {
        showModal.value = true;
    } else {
        localStorage.removeItem('selectedCar');
        router.push('/select');
    }
};

const discardChanges = () => {
    localStorage.removeItem('selectedCar');
    router.push('/select');
    closeModal();
};

const closeModal = () => {
    showModal.value = false;
};

definePageMeta({
    middleware: 'staff-auth'
});
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

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background-color: white;
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: fadeIn 0.3s ease-in-out;
    height: 200px;
}

.modal-btn {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: 1rem;
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