<template>
    <div class="flex flex-col items-center h-full p-4 w-full">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ยืนยันรายการที่เลือก</h2>
        <div class="flex space-x-4 mb-6">
            <div class="space-y-2">
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Unit Type :</strong> {{ selectedCar.unitType }}
                </p>
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Model Class :</strong> {{ selectedCar.modelClass }}
                </p>
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Model Code Name :</strong> {{ selectedCar.modelCodeName }}
                </p>
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Model G name :</strong> {{ selectedCar.modelGName }}
                </p>
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Price :</strong> {{ selectedCar.price }}
                </p>
                <p class="p-3 rounded-md text-lg text-black">
                    <strong>Color :</strong> {{ selectedCar.color }}
                </p>
            </div>
        </div>
        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />
</template>

<script setup>
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuotationStore } from '~/stores/quotation';

const router = useRouter();
const quotationStore = useQuotationStore();
const selectedCar = computed(() => quotationStore.selectedCar);
const showModal = ref(false);
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const fetchUnitId = async (unitType) => {
    try {
        const response = await axios.get(`${apiUrl}/standard-base?filter=unitType||$eq||${unitType}&filter=status||$eq||1`);
        if (response.data && response.data.length > 0) {
            quotationStore.setSelectedCar({ ...selectedCar.value, id: response.data[0].id });
        }
    } catch (error) {
        console.error('Error fetching unit ID:', error);
    }
};

onMounted(() => {
    const unitType = selectedCar.value?.unitType;
    const hasId = Boolean(selectedCar.value?.id);
    if (unitType && !hasId) {
        fetchUnitId(unitType);
    }
});

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
        quotationStore.setSelectedCar({});
        router.push('/select-car');
    }
};

const discardChanges = () => {
    quotationStore.setSelectedCar({});
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