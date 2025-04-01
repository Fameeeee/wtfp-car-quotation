<template>
    <div class="flex justify-center p-8">
        <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 border">
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
            <buttonGroup :goBack="goBack" :goNext="goNext" />
        </div>
    </div>

    <modalConfirm v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />
</template>

<script setup>
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalConfirm from '~/components/user/modalConfirm.vue';
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

const goNext = async () => {
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