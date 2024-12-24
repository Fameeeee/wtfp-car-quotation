<template>
  <NuxtLink to="/select">
    <div>
      < Back
    </div>
  </NuxtLink>
  <div>
    <p>{{ modelName || 'N/A' }}</p>
    <div v-if="carData.length > 0">
      <img :src="currentImageUrl" alt="Car Model" class="car-model" />
      <p>Color: {{ currentColor }}</p>
      <div class="color-buttons">
        <button
          v-for="(color, index) in availableColors"
          :key="index"
          :class="['color-button', { active: color === currentColor }]"
          @click="switchColor(color)"
        >
          {{ color }}
        </button>
      </div>
    </div>
    <p v-else>No car data available</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const modelName = ref('');
const carData = ref([]);
const currentColor = ref('');
const currentImageUrl = ref('');
const availableColors = ref([]);
const route = useRoute();

const switchColor = (color) => {
  const car = carData.value.find((item) => item.color === color);
  if (car) {
    currentColor.value = car.color;
    currentImageUrl.value = car.image_url;
  }
};

onMounted(async () => {
  modelName.value = decodeURIComponent(route.params.id || '');

  if (modelName.value) {
    try {
      const response = await axios.get(
        `http://localhost:3001/car-model/${modelName.value}`
      );
      carData.value = response.data || [];

      // Set the initial color and image
      if (carData.value.length > 0) {
        currentColor.value = carData.value[0].color;
        currentImageUrl.value = carData.value[0].image_url;
        availableColors.value = [
          ...new Set(carData.value.map((item) => item.color)),
        ];
      }
    } catch (error) {
      console.error('Error fetching car model data:', error);
    }
  }
});
</script>

<style scoped>
.car-model {
  height: 150px;
  margin: 10px 0;
}

.color-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.color-button {
  padding: 5px 10px;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  border-radius: 4px;
}

.color-button.active {
  background-color: #007bff;
  color: white;
}
</style>
