<template>
  <NuxtLink to="/select" class="back">
    <div class="back-btn">
      < Back </div>
  </NuxtLink>
  <div class="model">
    <p class="car-name">{{ modelName || 'N/A' }}</p>
    <div v-if="carData.length > 0" class="car-model">
      <img :src="currentImageUrl" alt="Car Model" class="car-img" />
      <div class="color-buttons">
        <button v-for="(color, index) in availableColors" :key="index"
          :class="['color-button', { active: color === currentColor }]" @click="switchColor(color)">
          {{ color }}
        </button>
      </div>
      <p class="car-color">สีตัวถัง : {{ currentColor }}</p>
    </div>
    <p v-else>No car data available</p>
    <div class="select-model-btn">
      <button class="select-btn" @click="openModal">เลือกรุ่นรถ <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_659_21)">
            <path
              d="M24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12ZM12.75 6.75C12.75 6.55109 12.671 6.36032 12.5303 6.21967C12.3897 6.07902 12.1989 6 12 6C11.8011 6 11.6103 6.07902 11.4697 6.21967C11.329 6.36032 11.25 6.55109 11.25 6.75V15.4395L8.031 12.219C7.89017 12.0782 7.69916 11.9991 7.5 11.9991C7.30084 11.9991 7.10983 12.0782 6.969 12.219C6.82817 12.3598 6.74905 12.5508 6.74905 12.75C6.74905 12.9492 6.82817 13.1402 6.969 13.281L11.469 17.781C11.5387 17.8508 11.6214 17.9063 11.7125 17.9441C11.8037 17.9819 11.9013 18.0013 12 18.0013C12.0987 18.0013 12.1963 17.9819 12.2874 17.9441C12.3786 17.9063 12.4613 17.8508 12.531 17.781L17.031 13.281C17.1718 13.1402 17.2509 12.9492 17.2509 12.75C17.2509 12.5508 17.1718 12.3598 17.031 12.219C16.8902 12.0782 16.6992 11.9991 16.5 11.9991C16.3008 11.9991 16.1098 12.0782 15.969 12.219L12.75 15.4395V6.75Z"
              fill="black" />
          </g>
          <defs>
            <clipPath id="clip0_659_21">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>
    </div>
    <div class="next-btn">
      <button class="next">ต่อไป</button>
    </div>
    <SelectModal :show="isModalVisible" :modalData="carModels" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import SelectModal from '~/components/SelectModal.vue';

const modelName = ref('');
const carData = ref([]);
const currentColor = ref('');
const currentImageUrl = ref('');
const availableColors = ref([]);
const route = useRoute();
const isModalVisible = ref(false);

const carModels = ref([
  { name: '3.0 Ddi Z 2-door', price: '937,000 THB' },
  { name: '3.0 Ddi Z 4-door', price: '1,054,000 THB' },
  { name: '3.0 Ddi ZP 4-door', price: '1,169,000 THB' },
  { name: '3.0 Ddi M 4-door AT', price: '1,277,000 THB' }
]);

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

const openModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};
</script>

<style scoped>
.back {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15vw;
  height: 5vh;
  background: #CD2727;
  text-decoration: none;
  color: #FFFFFF;
  border-radius: 7px;
  font-family: 'Lexend Giga';
}

.model,
.car-model {
  display: flex;
  flex-direction: column;
  align-items: center;

}

.car-name {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #FFFFFF;
  background: #CD2727;
  height: 5vh;
  width: fit-content;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 24px;
  font-family: 'Lexend Giga';
}

.car-img {
  height: 170px;
  margin: 10px 0;

}

.color-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: center;
}

.color-button {
  width: fit-content;
  height: 50px;
  padding: 5px 10px;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-size: 10px;
}

.color-button.active {
  border: 2px solid #000000;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4);
}

.car-color {
  margin-top: 30px;
  font-size: 18px;
  font-family: 'Lexend Giga';
}

.select-model-btn {
  display: flex;
  justify-content: center;
  margin-top: 5vh;
}

.select-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 9px 51px;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  font-family: 'Lexend Giga';
  font-size: 26px;
}

.next-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}

.next {
  width: 115px;
  height: 40px;
  background: #980000;
  border-radius: 7px;
  font-family: 'Lexend Giga';
  color: #FFFFFF;
  border: none;
}
</style>
