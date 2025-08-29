<template>
  <div class="overflow-x-auto bg-white border">
    <table class="min-w-full text-sm text-center text-black">
      <thead class="bg-[#980000]">
        <tr>
          <th class="px-1 py-1 border scale-text text-white border-black">ส่วนลด</th>
          <th class="px-1 py-1 border scale-text text-white border-black">ส่วนเพิ่ม</th>
          <th class="px-1 py-1 border scale-text text-white border-black">ราคาสุทธิ</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="px-1 py-1 border scale-text">{{ formatBaht(cashPlan.specialDiscount) }}</td>
          <td class="px-1 py-1 border scale-text">{{ formatBaht(cashPlan.specialAddition) }}</td>
          <td class="px-1 py-1 border scale-text">{{ formatBaht(cashPlan.totalPrice) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const cashPlan = ref({});

const route = useRoute();
const quotationId = route.params.id;
const quotationStore = useQuotationStore();

const fetchDataFromStore = () => {
  cashPlan.value = quotationStore.cashPlan || {};
};

const fetchDataFromApi = async () => {
  try {
    const response = await axios.get(`${backendUrl}/quotation/${quotationId}`);
    cashPlan.value = response.data.cashPlans || {};
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

const formatBaht = (val) => {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return '฿0';
  return num.toLocaleString('th-TH') + ' ฿';
};
</script>

<style scoped>
.overflow-x-auto {
  max-width: 100%;
  max-height: fit-content;
  overflow: auto;
}

table {
  width: 100%;
  table-layout: fixed;
}

.scale-text {
  font-size: 0.8rem;
  overflow: hidden;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  word-break: break-word;
}

th,
td {
  overflow: hidden;
}

hr {
  margin: 0;
}

@media (max-width: 600px) {
  .scale-text {
    font-size: 0.5rem;
  }
}
</style>