<template>
  <div class="flex flex-col items-center h-full p-4 space-y-6">
    <h2 class="text-4xl font-extrabold text-[#696969] my-4">อุปกรณ์ตกแต่ง</h2>
    <input v-model="searchQuery" type="text" placeholder="ค้นหาอุปกรณ์"
      class="w-full p-3 mb-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-500" />

    <div v-if="searchQuery" class="w-full max-w-lg bg-white shadow-lg rounded-lg mt-2 max-h-60 overflow-auto">
      <div v-for="item in filteredAccessories" :key="item.id"
        class="p-3 border-b flex justify-between cursor-pointer hover:bg-gray-100" @click="selectAccessory(item)">
        <span class="text-black font-medium">{{ item.assName }}</span>
        <span class="text-black">{{ item.price.toLocaleString() }} ฿</span>
      </div>
      <div v-if="filteredAccessories.length === 0" class="p-3 text-gray-500 text-center">
        ไม่พบอุปกรณ์ที่ค้นหา
      </div>
    </div>

    <div class="w-full bg-white shadow-lg rounded-lg p-4">
      <table class="min-w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-100 border-b">
            <th class="px-4 py-3 text-left text-sm text-black">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll"
                class="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500" />
            </th>
            <th class="px-4 py-3 text-left text-sm text-black">รายการทั้งหมด</th>
            <th class="px-4 py-3 text-left text-sm text-black">ราคา</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in displayedAccessories" :key="item.id" class="hover:bg-gray-50 border-b">
            <td class="px-4 py-3">
              <input type="checkbox" :value="item" v-model="selectedAccessories" @change="handleSelectionChange(item)"
                class="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500" />
            </td>
            <td class="px-4 py-3 text-sm text-black">{{ item.assName }}</td>
            <td class="px-4 py-3 text-sm text-black text-right whitespace-normal break-words max-w-[120px]">
              <span class="whitespace-nowrap">
                {{ item.price.toLocaleString() }} ฿
              </span>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <div class="mb-0 text-lg font-bold text-black">ราคารวม: {{ totalPrice.toLocaleString() }} ฿</div>

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
import axios from 'axios';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const accessories = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedAccessories = ref([]);
const selectAll = ref(false);

const fetchAccessories = async () => {
  const selectedCar = JSON.parse(localStorage.getItem('selectedCar'));
  if (selectedCar?.id) {
    try {
      const response = await axios.get(`${apiUrl}/standard-base/standard-name/${selectedCar.id}`);
      const data = await response.data;
      accessories.value = data[0].StandardAccBase.map(item => ({
        assType: item.accBase.assType,
        assName: item.accBase.assName,
        price: isNaN(parseFloat(item.accBase.itemCostIncVat)) ? 0 : parseFloat(item.accBase.itemCostIncVat),
        id: item.idAccBase
      }));
      selectedAccessories.value = accessories.value.filter(item => item.assType === 'ของแต่งมาตรฐาน');
    } catch (error) {
      console.error('Error fetching accessories:', error);
    }
  }
};

onMounted(fetchAccessories);

const displayedAccessories = computed(() => {
  return [
    ...accessories.value.filter(item => item.assType === 'ของแต่งมาตรฐาน'),
    ...selectedAccessories.value.filter(item => item.assType !== 'ของแต่งมาตรฐาน')
  ];
});

const filteredAccessories = computed(() => {
  return accessories.value.filter(item => item.assType !== 'ของแต่งมาตรฐาน' &&
    (item.assName.includes(searchQuery.value) || item.assType.includes(searchQuery.value)));
});

const totalPrice = computed(() => {
  return selectedAccessories.value.reduce((sum, item) => sum + item.price, 0);
});

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedAccessories.value = accessories.value.filter(item => item.assType === 'ของแต่งมาตรฐาน');
  } else {
    selectedAccessories.value = selectedAccessories.value.filter(item => item.assType !== 'ของแต่งมาตรฐาน');
  }
  updateLocalStorage();
};

const selectAccessory = (item) => {
  if (!selectedAccessories.value.some(acc => acc.id === item.id)) {
    selectedAccessories.value.push(item);
  }
  updateLocalStorage();
};

const handleSelectionChange = (item) => {
  if (item.assType !== 'ของแต่งมาตรฐาน' && !selectedAccessories.value.includes(item)) {
    selectedAccessories.value = selectedAccessories.value.filter(acc => acc.id !== item.id);
  }
  updateLocalStorage();
};

const updateLocalStorage = () => {
  localStorage.setItem('selectedAccessories', JSON.stringify(selectedAccessories.value));
};

watch(selectedAccessories, updateLocalStorage, { deep: true });

const goBack = async () => {
  if (selectedAccessories.value) {
    showModal.value = true;
  } else {
    localStorage.removeItem('selectedAccessories');
    router.push('/calculate');
  }
};

const discardChanges = () => {
  localStorage.removeItem('selectedAccessories');
  router.push('/calculate');
  closeModal();
};

const closeModal = () => {
  showModal.value = false;
};

const goNext = () => {
  router.push('/add-cost')
}

definePageMeta({
  middleware: 'staff-auth'
});
</script>
