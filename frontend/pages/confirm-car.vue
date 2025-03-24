<template>
    <div class="flex justify-center mt-8 p-8 bg-gray-100">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 mt-8">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-semibold text-gray-800">ยืนยันรายการที่เลือก</h2>
            </div>
            <div class="text-left">
                <div class="space-y-4">
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Unit Type :</strong> {{ selectedCar.unitType }}
                    </p>
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Model Class :</strong> {{ selectedCar.modelClass }}
                    </p>
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Model Code Name :</strong> {{ selectedCar.modelCodeName }}
                    </p>
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Model G name :</strong> {{ selectedCar.modelGname }}
                    </p>
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Price :</strong> {{ selectedCar.price }}
                    </p>
                    <p class="p-3 bg-gray-50 rounded-md text-lg text-gray-600">
                        <strong>Color :</strong> {{ selectedCar.color }}
                    </p>
                </div>
            </div>
            <div class="flex gap-4 mt-8">
                <button @click="confirmSelection"
                    class="flex-1 py-3 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transform transition-transform duration-200 hover:scale-105">
                    ยืนยัน
                </button>
                <button @click="goBack"
                    class="flex-1 py-3 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
            </div>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <p class="text-lg text-[#696969] mb-4">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="flex gap-4 justify-center">
                <button @click="discardChanges"
                    class="py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transform transition-transform duration-200 hover:scale-105">
                    ยืนยัน
                </button>
                <button @click="closeModal"
                    class="py-3 px-6 text-lg font-medium text-[#696969] bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
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
        router.push('/calculate');
    } catch (error) {
        console.error('Error confirming selection:', error);
    }
};

const goBack = async () => {
    if (selectedCar.value) {
        showModal.value = true;
    } else {
        localStorage.removeItem('selectedCar');
        router.push('/select-car');
    }
};

const discardChanges = () => {
    localStorage.removeItem('selectedCar');
    router.push('/select-car');
    closeModal();
};

const closeModal = () => {
    showModal.value = false;
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>