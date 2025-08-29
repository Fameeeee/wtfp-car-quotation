<template>
  <div class="bg-white border p-3 text-black">
    <div class="flex items-start gap-4 flex-col sm:flex-row">
      <div class="w-[140px] h-[100px] border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        <img v-if="carDetails?.imageUrl" :src="carDetails.imageUrl" alt="car" class="max-w-full max-h-full object-contain"/>
        <span v-else>รูปภาพรถ</span>
      </div>
      <div class="flex-1 text-sm leading-6">
        <div><span class="font-semibold">รุ่นปีรถ:</span> {{ carDetails?.modelClass || '-' }}</div>
        <div><span class="font-semibold">รุ่นรถ:</span> {{ carDetails?.modelGName || '-' }}</div>
        <div><span class="font-semibold">สีตัวถัง:</span> {{ carDetails?.color || '-' }}</div>
        <div><span class="font-semibold">แรงม้า:</span> {{ horsepowerText }}</div>
        <div><span class="font-semibold">แรงบิด:</span> {{ torqueText }}</div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const carDetails = ref({});

const route = useRoute();
const quotationId = route.params.id;
const quotationStore = useQuotationStore();

const fetchDataFromStore = () => {
  carDetails.value = quotationStore.selectedCar || {};
};

const fetchDataFromApi = async () => {
  try {
    const response = await axios.get(`${backendUrl}/quotation/${quotationId}`);
    carDetails.value = response.data.carDetails || {};
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
};

onMounted(() => {
  if (quotationId) {
    fetchDataFromApi();
  } else {
  fetchDataFromStore();
  }
});

// mock/derived values
const horsepowerText = computed(() => {
  const hp = carDetails.value?.horsepower;
  return hp ? `${hp} แรงม้า` : '190 แรงม้า';
});

const torqueText = computed(() => {
  const tq = carDetails.value?.torque;
  return tq ? `${tq} นิวตัน-เมตร` : '450 นิวตัน-เมตร';
});
</script>

<style scoped>
/* Keep text readable on small screens */
@media (max-width: 640px) {
  .text-sm { font-size: 0.9rem; }
}
</style>
