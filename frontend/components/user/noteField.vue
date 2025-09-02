<template>
  <div class="flex flex-col gap-2 ">
    <div class="scale-text min-h-[50px] p-1 text-black bg-gray-100 whitespace-pre-wrap break-words overflow-hidden">
      {{ (note) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useQuotationStore } from '~/stores/quotation';

const config = useRuntimeConfig()
const api = useApi();


const note = ref('');
const route = useRoute();
const quotationId = route.params.id;
const quotationStore = useQuotationStore();

const fetchNoteFromApi = async () => {
  try {
  const response = await api.get(`/quotation/${quotationId}`);
    note.value = response.data?.additionCosts?.note || '';
  } catch (error) {
    console.error('Error fetching note from API:', error);
  }
};

const fetchNoteFromStore = () => {
  const additionCost = quotationStore.additionCost || {};
  note.value = additionCost.noteText || '';
};

onMounted(() => {
  if (quotationId) {
    fetchNoteFromApi();
  } else {
    fetchNoteFromStore();
  }
});
</script>

<style scoped>
.scale-text {
  font-size: 1rem;
  overflow: hidden;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  word-break: break-word;
}

@media (max-width: 600px) {
  .scale-text {
    font-size: 0.7rem;
  }
}
</style>