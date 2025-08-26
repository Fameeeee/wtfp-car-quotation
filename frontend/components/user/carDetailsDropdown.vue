<template>
  <div class="w-full border border-black rounded-md font-semibold">
    <!-- Dropdown Header -->
    <div class="flex items-center justify-between p-4 gap-2 cursor-pointer" @click="toggle">
      <div class="font-semibold">{{ label }}</div>
      <svg :class="{ 'rotate-180': open }" class="transition-transform duration-300" width="35" height="35"
        viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.2083 14.5833L17.4999 21.8749L24.7916 14.5833" stroke="black" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <!-- Dropdown Content with Smooth Transition -->
    <transition name="slide-fade">
      <div v-show="open" class="p-6 border-t border-black space-y-6 bg-white rounded-lg shadow-md">
        <div v-if="loading">Loading...</div>
        <div v-else>
          <!-- Custom slot for data -->
          <slot :data="localData">
            <!-- Default rendering if no slot is provided -->
            <div class="flex flex-col">
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Unit Type</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.unitType }}</div>
              </div>
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Model Class</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.modelClass }}</div>
              </div>
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Model Code Name</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.modelCodeName }}</div>
              </div>
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Model G Name</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.modelGName }}</div>
              </div>
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Color</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.color }}</div>
              </div>
              <div class="p-2 flex flex-col gap-2">
                <label class="block text-black text-sm">Price</label>
                <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ localData.price }}</div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  label: String,
  quotationId: [String, Number],
  modelValue: Object,
});

const emit = defineEmits(['update']);

const open = ref(false);
const loading = ref(false);
const localData = ref({ ...props.modelValue });

const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

// Sync localData with parent
watch(localData, (newVal) => emit('update', newVal), { deep: true });

// Fetch data immediately on mount
const fetchData = async () => {
  if (!props.quotationId) return;
  loading.value = true;
  try {
    const response = await axios.get(`${backendUrl}/quotation/${props.quotationId}`);
    localData.value = response.data.carDetails || {};
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const toggle = () => {
  open.value = !open.value;
  if (open.value && Object.keys(localData.value).length === 0) {
    fetchData();
  }
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}
</style>
