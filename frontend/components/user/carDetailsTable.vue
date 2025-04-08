<template>
    <div class="overflow-x-auto bg-white border">
      <table class="min-w-full table-fixed text-sm text-center text-black">
        <thead class="bg-gray-300">
          <tr>
            <th class="px-2 py-1 border scale-text w-[25%]">รุ่นปีรถ</th>
            <th class="px-2 py-1 border scale-text w-[25%]">รุ่นรถ</th>
            <th class="px-2 py-1 border scale-text w-[25%]">สีตัวถัง</th>
            <th class="px-2 py-1 border scale-text w-[25%]">ราคารถ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-2 py-1 border scale-text">{{ carDetails.modelClass }}</td>
            <td class="px-2 py-1 border scale-text">{{ carDetails.modelGname }}</td>
            <td class="px-2 py-1 border scale-text">{{ carDetails.color }}</td>
            <td class="px-2 py-1 border scale-text">{{ carDetails.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const carDetails = ref({
    modelClass: '',
    modelGname: '',
    color: '',
    price: ''
  });
  
  onMounted(() => {
    const storedCarDetails = localStorage.getItem('selectedCar');
    if (storedCarDetails) {
      carDetails.value = JSON.parse(storedCarDetails);
    }
  });
  </script>
  
  <style scoped>
  .scale-text {
    font-size: 0.8rem;
    overflow: hidden;
    line-height: 1.5;
    word-break: break-word;
    box-sizing: border-box;
  }
  
  th,
  td {
    overflow: hidden;
  }
  
  @media (max-width: 600px) {
    .scale-text {
      font-size: 0.5rem;
    }
  }
  </style>
  