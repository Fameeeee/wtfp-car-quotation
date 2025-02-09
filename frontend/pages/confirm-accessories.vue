<template>
    <div class="container">
        <div class="card">
            <div class="card-title">
                <h2 class="title">ยืนยันรายการที่เลือก</h2>
            </div>
            <div class="card-body">
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{ selectedCar.unitType }}</td>
                            <td>{{ selectedCar.modelGname }}</td>
                            <td>{{ selectedCar?.price?.toLocaleString() ?? '0' }} ฿</td>
                        </tr>
                        <tr v-for="(accessory, index) in selectedAccessories" :key="index">
                            <td>{{ accessory.assType }}</td>
                            <td>{{ accessory.assName }}</td>
                            <td>{{ accessory?.price?.toLocaleString() ?? '0' }} ฿</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2"><strong>Total Price</strong></td>
                            <td><strong>{{ totalPrice.toLocaleString() }} บาท</strong></td>
                        </tr>
                    </tfoot>
                </table>
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

const router = useRouter();
const selectedCar = ref({});
const selectedAccessories = ref({});
const showModal = ref(false);

onMounted(() => {
    const storedAccessories = localStorage.getItem('selectedAccessories');
    const storedCar = localStorage.getItem('selectedCar');
    try {
        selectedAccessories.value = storedAccessories ? JSON.parse(storedAccessories) : [];
        if (!Array.isArray(selectedAccessories.value)) {
            selectedAccessories.value = [];
        }
        if (storedCar) {
            selectedCar.value = JSON.parse(storedCar);
        }
    } catch (error) {
        console.error('Error parsing selectedAccessories:', error);
        selectedAccessories.value = [];
    }
});

const totalPrice = computed(() => {
    const carPrice = Number(selectedCar.value?.price) || 0;
    const accessoriesPrice = Array.isArray(selectedAccessories.value)
        ? selectedAccessories.value.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
        : 0;
    return carPrice + accessoriesPrice;
});


const confirmSelection = async () => {
    try {
        router.push('/calculate');
    } catch (error) {
        console.error('Error confirming selection:', error);
    }
};

const goBack = async () => {
    if (selectedAccessories.value) {
        showModal.value = true;
    } else {
        localStorage.removeItem('selectedAccessories');
        router.push('/select-accessories');
    }
};

const discardChanges = () => {
    localStorage.removeItem('selectedAccessories');
    router.push('/select-accessories');
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
    height: fit-content;
}

.card {
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 480px;
    height: fit-content;
    padding: 2rem;
    margin-top: 2rem;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center
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
    width: 100%;
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

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
}

th,
td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f9fafb;
    font-weight: 600;
}

tfoot td {
    font-size: 1.2rem;
    font-weight: bold;
    background-color: #f3f4f6;
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