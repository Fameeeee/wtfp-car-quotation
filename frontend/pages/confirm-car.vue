<template>
    <div class="flex flex-col items-center h-full p-2 sm:p-4 w-full">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#696969] my-3 sm:my-4 text-center px-2">ยืนยันรายการที่เลือก</h2>
        
        <!-- Car Details Card -->
        <div class="w-full max-w-2xl mx-auto p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl shadow-lg mb-4 sm:mb-6">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-gray-200">รายละเอียดรถยนต์</h3>
            
            <div class="space-y-3 sm:space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-gray-600">Unit Type</span>
                    <span class="text-sm sm:text-base font-medium text-gray-900 break-words">{{ selectedCar.unitType }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-gray-600">Model Class</span>
                    <span class="text-sm sm:text-base font-medium text-gray-900 break-words">{{ selectedCar.modelClass }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-gray-600">Model Code Name</span>
                    <span class="text-sm sm:text-base font-medium text-gray-900 break-words">{{ selectedCar.modelCodeName }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-gray-600">Model G Name</span>
                    <span class="text-sm sm:text-base font-medium text-gray-900 break-words">{{ selectedCar.modelGName }}</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-blue-900">Price</span>
                    <span class="text-base sm:text-lg font-bold text-blue-900">{{ Number(selectedCar.price).toLocaleString() }} บาท</span>
                </div>
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow gap-1 sm:gap-0">
                    <span class="text-xs sm:text-sm font-semibold text-gray-600">Color</span>
                    <span class="text-sm sm:text-base font-medium text-gray-900 break-words">{{ selectedCar.color }}</span>
                </div>
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
import { useExternalApi } from '~/composables/useExternalApi';
import { useQuotationStore } from '~/stores/quotation';

const router = useRouter();
const quotationStore = useQuotationStore();
const selectedCar = computed(() => quotationStore.selectedCar);
const showModal = ref(false);
const externalApi = useExternalApi();

const fetchUnitId = async (unitType) => {
    try {
        if (!externalApi) {
            console.error('External API not configured');
            return;
        }
        
        const response = await externalApi.get(`/standard-base?filter=unitType||$eq||${unitType}&filter=status||$eq||1`);
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
        toast.success('ยืนยันรายการที่เลือกสำเร็จ');
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