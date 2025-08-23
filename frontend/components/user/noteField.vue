<template>
  <div class="flex flex-col gap-2 ">
    <div class="scale-text min-h-[50px] p-1 text-black bg-gray-100 whitespace-pre-wrap break-words overflow-hidden">
      {{ defaultText + (note ? '\n' + note : '') }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const defaultText = '- รับประกันผลิตภัณท์รถยนต์ 3 ปี หรือ 100,000 กม. แล้วแต่อย่างใดอย่างหนึ่งถึงก่อน\n- เงื่อนไขต่างๆอาจมีการเปลี่ยนแปลงโดยไม่่ต้องแจ้งให้ทราบล่วงหน้า';
const note = ref('');
const route = useRoute();
const quotationId = route.params.id;

const fetchNoteFromApi = async () => {
  try {
    const response = await axios.get(`${backendUrl}/quotation/${quotationId}`);
    note.value = response.data?.additionCosts?.note || '';
  } catch (error) {
    console.error('Error fetching note from API:', error);
  }
};

const fetchNoteFromLocalStorage = () => {
  const storedAdditionCost = localStorage.getItem('additionCost');
  if (storedAdditionCost) {
    try {
      const parsed = JSON.parse(storedAdditionCost);
      note.value = parsed.note || '';
    } catch (error) {
      console.error('Error parsing additionCost:', error);
    }
  }
};

onMounted(() => {
  if (quotationId) {
    fetchNoteFromApi();
  } else {
    fetchNoteFromLocalStorage();
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