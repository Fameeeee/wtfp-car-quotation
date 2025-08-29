<template>
  <div class="flex flex-col items-center h-full p-4 space-y-6">
    <h2 class="text-4xl font-extrabold text-[#696969] my-4">อุปกรณ์ตกแต่ง</h2>
    <input v-model="searchQuery" type="text" placeholder="ค้นหาอุปกรณ์"
      class="w-full p-3 mb-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-500" />

    <div v-if="searchQuery" class="w-full max-w-lg bg-white shadow-lg rounded-lg mt-2 max-h-60 overflow-auto">
      <div v-for="item in filteredAccessories" :key="item.id"
        class="p-3 border-b flex items-center justify-between hover:bg-gray-100">
        <div class="flex flex-col">
          <span class="text-black font-medium">{{ item.assName }}</span>
          <span class="text-black text-sm">{{ item.price.toLocaleString() }} ฿</span>
        </div>
        <button class="px-3 py-1 text-white bg-black rounded-md hover:bg-gray-800" @click.stop="addAccessory(item)">
          เพิ่ม
        </button>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuotationStore } from '~/stores/quotation';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const accessories = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedAccessories = ref([]);
const selectAll = ref(false);
const quotationStore = useQuotationStore();
const selectedCar = computed(() => quotationStore.selectedCar || {});

const fetchAccessories = async () => {
  const car = selectedCar.value;
  if (car?.id) {
    try {
      const response = await axios.get(`${apiUrl}/standard-base/standard-name/${car.id}`);
      const data = await response.data;
      accessories.value = data[0].StandardAccBase.map(item => ({
        assType: item.accBase.assType,
        assName: item.accBase.assName,
        price: isNaN(parseFloat(item.accBase.itemCostIncVat)) ? 0 : parseFloat(item.accBase.itemCostIncVat),
        id: item.idAccBase
      }));
      // Prefer existing selection from store; otherwise default to standard accessories
      if (quotationStore.selectedAccessories && quotationStore.selectedAccessories.length) {
        selectedAccessories.value = [...quotationStore.selectedAccessories];
      } else {
        selectedAccessories.value = accessories.value.filter(item => item.assType === 'ของแต่งมาตรฐาน');
        quotationStore.setSelectedAccessories(selectedAccessories.value);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
    }
  }
};

onMounted(fetchAccessories);

// If we arrive before the ID is present, refetch as soon as it appears
watch(
  () => selectedCar.value?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      fetchAccessories();
    }
  }
);

const displayedAccessories = computed(() => {
  return [
    ...accessories.value.filter(item => item.assType === 'ของแต่งมาตรฐาน'),
    ...selectedAccessories.value.filter(item => item.assType !== 'ของแต่งมาตรฐาน')
  ];
});

const filteredAccessories = computed(() => {
  const q = searchQuery.value.trim();
  const selectedIds = new Set(selectedAccessories.value.map(a => a.id));
  return accessories.value.filter(item =>
    item.assType !== 'ของแต่งมาตรฐาน' &&
    !selectedIds.has(item.id) &&
    (q === '' || item.assName.includes(q) || item.assType.includes(q))
  );
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
  updateStore();
};

const addAccessory = (item) => {
  if (!selectedAccessories.value.some(acc => acc.id === item.id)) {
    selectedAccessories.value.push(item);
  }
  updateStore();
};

const handleSelectionChange = (item) => {
  if (item.assType !== 'ของแต่งมาตรฐาน' && !selectedAccessories.value.includes(item)) {
    selectedAccessories.value = selectedAccessories.value.filter(acc => acc.id !== item.id);
  }
  updateStore();
};

const updateStore = () => {
  try {
    quotationStore.setSelectedAccessories(selectedAccessories.value);
  } catch {}
};

watch(selectedAccessories, updateStore, { deep: true });

const goBack = async () => {
  if (selectedAccessories.value) {
    showModal.value = true;
  } else {
    try { quotationStore.setSelectedAccessories([]); } catch {}
    router.push('/calculate');
  }
};

const discardChanges = () => {
  try { quotationStore.setSelectedAccessories([]); } catch {}
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
