<template>
  <div class="w-full border border-black rounded-md font-semibold">
    <div
      class="flex items-center justify-between p-4 gap-2 cursor-pointer"
      @click="toggle"
    >
      <div class="font-semibold">{{ label }}</div>
      <svg
        :class="{ 'rotate-181': open }"
        class="transition-transform duration-300"
        width="35" height="35"
        viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.2083 14.5833L17.4999 21.8749L24.7916 14.5833"
              stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <transition name="slide-fade">
      <div v-if="open" class="p-4 border-t border-black">
        <div v-if="loading">Loading...</div>
        <div v-else>
          <slot :data="data">
            <pre>{{ data }}</pre>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  label: String,
  quotationId: [String, Number],
});

const open = ref(false);
const loading = ref(false);
const data = ref(null);
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const toggle = async () => {
  open.value = !open.value;

  if (open.value && !data.value) {
    loading.value = true;
    try {
      const response = await axios.get(`${backendUrl}/quotation/${props.quotationId}`);
      data.value = response.data.carDetails;
    } catch (err) {
      data.value = 'Error fetching data';
      console.error(err);
    } finally {
      loading.value = false;
    }
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
.rotate-180 {
  transform: rotate(180deg);
}
</style>
