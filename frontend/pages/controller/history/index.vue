<template>
  <div class="h-full bg-[#ececec] text-black p-5">
    <div class="flex justify-between items-center py-3 mb-3">
      <div class="text-5xl font-bold text-black">History</div>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative inline-block text-left items-center" style="margin-bottom: 10px;">
        <button @click="toggleDropdown"
          class="flex items-center !pl-6 px-3 py-2 w-28 bg-white border border-gray-300 rounded-md transition-all duration-300 ease-in-out h-10 hover:bg-gray-100 text-black">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6H21M6 12H18M9 18H15" stroke="black" stroke-width="2" stroke-linecap="round" />
          </svg>
          Filter
        </button>
        <div v-if="isOpen"
          class="absolute left-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-xl z-10 overflow-hidden">
          <ul class="py-2">
            <li @click="selectFilter(3)"
              class="text-center px-4 py-2 text-gray-700 hover:bg-gray-300 hover:text-white transition duration-200 cursor-pointer border-b border-gray-200">
              3 วัน
            </li>
            <li @click="selectFilter(7)"
              class="text-center px-4 py-2 text-gray-700 hover:bg-gray-300 hover:text-white transition duration-200 cursor-pointer border-b border-gray-200">
              7 วัน
            </li>
            <li @click="selectFilter(0)"
              class="text-center px-4 py-2 text-gray-700 hover:bg-gray-300 hover:text-white transition duration-200 cursor-pointer">
              ทุกวัน
            </li>
          </ul>
        </div>
      </div>

      <div class="relative w-full max-w-[230px]" style="margin-bottom: 10px;">
        <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา"
          class="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white h-10 !pl-3 text-gray-500" />
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg flex-1 overflow-hidden">
      <div class="overflow-x-hidden">
        <table v-if="!loading" class="w-full border-collapse border-spacing-0 table-fixed">
          <thead
            class="bg-[#f1f5f9] text-[#475569] font-semibold px-5 py-[14px] text-[0.9rem] border-b-2 border-[#e2e8f0] text-left">
            <tr>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
              </th>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
                ไอดี</th>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
                วันที่</th>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
                ชื่อพนักงาน</th>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
                ชื่อลูกค้า</th>
              <th
                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-black font-semibold text-[0.9rem] border-b-2 border-gray-300">
                รุ่นรถ</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredHistoryList.length === 0">
              <td colspan="6" class="text-center h-[200px]">
                <div class="flex flex-col items-center justify-center gap-3 p-10 text-gray-400">
                  <span class="text-base font-medium">ไม่พบข้อมูล</span>
                </div>
              </td>
            </tr>

            <tr v-else v-for="history in pagedHistoryList" :key="history.id"
              class="odd:bg-white even:bg-gray-50 transition-colors duration-200 hover:bg-gray-100">
              <td class="px-4 py-2 text-[#334155] border-b border-[#f1f4f9] text-[0.95rem]">
                <NuxtLink :to="`/controller/history/${history.quotationId}`" class="inline-flex">
                  <svg
                    class="w-6 h-6 rounded-md opacity-70 hover:opacity-100 hover:bg-gray-200 hover:scale-110 transition-all cursor-pointer"
                    fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z"
                      fill="black" />
                  </svg>
                </NuxtLink>
              </td>
              <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200 break-words">
                {{ history.quotationId }}
              </td>
              <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200 break-words">
                {{ dayjs(history.quotationDate).format("DD/MM/YYYY") }}
              </td>
              <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200 break-words">
                {{ history.staff.firstName }}
              </td>
              <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200 break-words">
                {{ history.customer.firstName }}
              </td>
              <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200 break-words">
                {{ history.carDetails.modelGName }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex justify-center items-center gap-4 mt-6" style="margin-top: 10px;">
      <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out min-w-[42px] h-[38px] flex items-center justify-center shadow-md hover:bg-blue-600 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed">
        ⬅
      </button>

      <span class="text-gray-700 font-medium text-sm px-2 min-w-[120px] text-center">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg cursor-pointer transition-all duration-200 ease-in-out min-w-[42px] h-[38px] flex items-center justify-center shadow-md hover:bg-blue-600 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed">
        ➡
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import _ from "lodash";
import dayjs from "dayjs";

definePageMeta({
  layout: 'admin',
  middleware: "admin-auth",
});

const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const searchQuery = ref("");
const historyList = ref([]);
const itemsPerPage = 8;
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);

const isOpen = ref(false);
const selectedFilter = ref(0);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectFilter = (days) => {
  selectedFilter.value = days;
  isOpen.value = false;
  currentPage.value = 1;
};

const debouncedSearch = _.debounce(() => {
  currentPage.value = 1;
  fetchData();
}, 500);

const filteredHistoryList = computed(() => {
  let list = historyList.value;

  if (searchQuery.value) {
    list = list.filter(h =>
      h.staff.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      h.customer.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  if (selectedFilter.value > 0) {
    list = list.filter(h =>
      dayjs(h.quotationDate).isAfter(dayjs().subtract(selectedFilter.value, 'day'))
    );
  }

  total.value = list.length;
  totalPages.value = Math.ceil(list.length / itemsPerPage);
  return list;
});


const pagedHistoryList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredHistoryList.value.slice(start, start + itemsPerPage);
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${backendUrl}/quotation`);
    historyList.value = response.data.data;
  } catch (error) {
    console.error("Error fetching history data:", error);
  } finally {
    loading.value = false;
  }
};

watch(searchQuery, debouncedSearch);

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted(() => {
  fetchData();
});
</script>


<style scoped>
.sidebar-collapsed+.content {
  margin-left: 80px;
}

th {
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  padding: 14px 20px;
  font-size: 0.9rem;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

td {
  padding: 12px 20px;
  color: #334155;
  border-bottom: 1px solid #f1f4f9;
  font-size: 0.95rem;
}

tbody tr {
  transition: background-color 0.2s ease;
}

th:nth-child(1),
td:nth-child(1) {
  width: 100px;
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  width: 120px;
}

tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}
</style>
