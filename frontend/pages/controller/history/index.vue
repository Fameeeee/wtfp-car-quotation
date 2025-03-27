<template>
  <div class="flex min-h-screen w-screen bg-[#ececec] text-black">
    <AdminSidebar />
    <div class="flex flex-col flex-1 p-6 overflow-hidden h-205"
      style="margin-left: 100px; margin-right: 20px; margin-top: 45px;">

      <div class="flex justify-between items-center px-5 py-4 " style="margin-bottom: 20px;">
        <div class="text-5xl font-bold text-black">History</div>
      </div>

      <div class="flex items-center gap-4 mb-6">
        <div class="relative inline-block text-left items-center" style=" margin-bottom: 10px;">
          <button @click="toggleDropdown"
            class="flex items-center !pl-6 px-3 py-2 w-28 bg-white border border-gray-300 rounded-md transition-all duration-300 ease-in-out h-10 hover:bg-gray-100 text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <li @click="selectFilter(null)"
                class="text-center px-4 py-2 text-gray-700 hover:bg-gray-300 hover:text-white transition duration-200 cursor-pointer">
                ทุกวัน
              </li>
            </ul>
          </div>
        </div>
        <div class="relative w-full max-w-[230px] " style="margin-bottom: 10px;">
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา"
            class="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white h-10 !pl-3 text-gray-500" />
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg flex-1 overflow-auto">
        <div v-if="loading"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white bg-opacity-90 p-10 rounded-lg shadow-lg w-35 h-10 flex items-center justify-center">
          <div class="text-blue-500 font-medium flex items-center gap-2">
            <div class="w-5 h-5 border-3 border-blue-500 border-t-transparent border-solid rounded-full animate-spin">
            </div>
            กำลังโหลด...
          </div>
        </div>

        <div class="overflow-x-auto">
          <table v-if="!loading" class="w-full border-collapse min-w-[700px] border-spacing-0 table-fixed">
            <thead class="bg-[#f1f5f9] text-white font-bold text-[0.9rem] border-b-2 border-gray-300 text-left">
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
              <tr v-if="historyList.length === 0">
                <td colspan="6" class="text-center h-[200px]">
                  <div class="flex flex-col items-center justify-center gap-3 p-10 text-gray-400">
                    <span class="text-base font-medium">ไม่พบข้อมูล</span>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="history in filteredHistoryList" :key="history.id"
                class="odd:bg-white even:bg-gray-50 transition-colors duration-200 hover:bg-gray-100">
                <td class="px-4 py-2 text-[#334155] border-b border-[#f1f4f9] text-[0.95rem]">
                  <NuxtLink :to="`/controller/history/${history.id}`" class="inline-flex">
                    <svg
                      class="w-6 h-6 rounded-md opacity-70 hover:opacity-100 hover:bg-gray-200 hover:scale-110 transition-all cursor-pointer"
                      fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z"
                        fill="black" />
                    </svg>
                  </NuxtLink>
                </td>
                <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200">{{ history.id }}</td>
                <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200">{{
                  dayjs(history.quotationDate).format("DD/MM/YYYY") }}</td>
                <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200">{{ history.staff.firstName }}
                </td>
                <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200">{{ history.customer.firstName }}
                </td>
                <td class="px-4 py-2 text-left text-gray-700 border-b border-gray-200">{{ history.carDetails.modelGName
                }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import _ from 'lodash';
import dayjs from "dayjs";

definePageMeta({
  layout: false,
  middleware: "admin-auth",
});

const searchQuery = ref("");
const historyList = ref([]);
const itemsPerPage = 8;
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);

const debouncedSearch = _.debounce((event) => {
  searchHistory();
}, 500);

const isOpen = ref(false);
const selectedFilter = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectFilter = (days) => {
  selectedFilter.value = days;
  isOpen.value = false;
  applyFilter();
};



const filteredHistoryList = computed(() => {
  if (!selectedFilter.value) return historyList.value;

  const today = dayjs();
  const startDate = today.subtract(selectedFilter.value, "day").startOf("day");

  return historyList.value.filter((history) => {
    const historyDate = dayjs(history.quotationDate, "DD/MM/YYYY").startOf("day");
    return historyDate.isAfter(startDate) || historyDate.isSame(startDate, "day");
  });
});

const applyFilter = () => {
  if (!selectedFilter.value) {
    filteredHistoryList.value = historyList.value;
    return;
  }

  const today = dayjs();
  const startDate = today.subtract(selectedFilter.value, "day").startOf("day");

  filteredHistoryList.value = historyList.value.filter((history) => {
    const historyDate = dayjs(history.quotationDate).startOf("day");
    return historyDate.isAfter(startDate) || historyDate.isSame(startDate, "day");
  });
};



const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get("http://localhost:3001/quotation", {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        search: searchQuery.value
      }
    });

    historyList.value = response.data.data;
    totalPages.value = response.data.totalPages;
    total.value = response.data.total;

    applyFilter();

  } catch (error) {
    console.error("Error fetching history data:", error);
  } finally {
    loading.value = false;
  }
};


const searchHistory = () => {
  currentPage.value = 1;
  fetchData();
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchData();
  }
}

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
