<template>
  <div class="h-full bg-[#ececec] text-black p-4 md:p-5">
    <!-- Header -->
    <div class="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 bg-[#ececec] pb-3">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl md:text-3xl font-semibold">ประวัติใบเสนอราคา</h1>
      </div>
  <div class="mt-3 flex flex-wrap gap-2 items-center">
        <!-- Filter -->
        <div class="relative inline-block text-left">
          <button @click="toggleDropdown"
                  class="inline-flex items-center gap-2 px-3 py-2 h-10 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M6 12H18M9 18H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span>ช่วงเวลา</span>
          </button>
          <div v-if="isOpen" class="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <ul class="py-1 text-sm">
              <li @click="selectFilter(3)" class="px-3 py-2 hover:bg-gray-100 cursor-pointer">3 วัน</li>
              <li @click="selectFilter(7)" class="px-3 py-2 hover:bg-gray-100 cursor-pointer">7 วัน</li>
              <li @click="selectFilter(0)" class="px-3 py-2 hover:bg-gray-100 cursor-pointer">ทั้งหมด</li>
            </ul>
          </div>
        </div>
  <!-- Search -->
        <div class="relative flex-1 min-w-[200px] max-w-xs">
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหาใบเสนอราคา, ลูกค้า, รุ่นรถ..."
                 class="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z" fill="currentColor"/></svg>
        </div>
        <!-- Export CSV -->
        <div>
          <button @click="exportCsv" class="inline-flex items-center gap-2 px-3 py-2 h-10 bg-blue-600 text-white rounded-md text-sm hover:opacity-95">
            Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- List (table) -->
    <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm">
      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 8" :key="i" class="h-12 rounded bg-gray-100 animate-pulse"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">พนักงาน</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลูกค้า</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รุ่นรถ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredHistoryList.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>ไม่มีประวัติใบเสนอราคา</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="h in filteredHistoryList" :key="h.id" 
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="goToHistoryDetail(h.quotationId)">
              <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ h.quotationId }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ dayjs(h.quotationDate).format('DD/MM/YYYY') }}</td>
              <td class="px-4 py-3 text-sm text-gray-900">{{ h.staff?.firstName || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-900">{{ h.customer?.firstName || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ h.carDetails?.modelGName || '—' }}</td>
              <td class="px-4 py-3 text-sm">
                <button @click.stop="goToHistoryDetail(h.quotationId)"
                        class="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  ดูรายละเอียด
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="filteredHistoryList.length > 0">
      <Pagination
        :page="currentPage"
        :total-pages="totalPages"
        :show-page-size="true"
        :page-size="itemsPerPage"
        @update:page="changePage"
        @update:pageSize="updatePageSize"
      />
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from 'vue-router';
import axios from "axios";
import _ from "lodash";
import dayjs from "dayjs";
import Pagination from "~/components/common/Pagination.vue";

definePageMeta({
  layout: 'admin',
  middleware: "admin-auth",
});

const router = useRouter();
const config = useRuntimeConfig();
const api = useApi();

const searchQuery = ref("");
const pagedHistoryList = ref([]);  
const itemsPerPage = ref(8);       
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
  fetchData();
};

const filteredHistoryList = computed(() => {
  // Server already supports days/search; keep a light client filter for safety
  const base = pagedHistoryList.value || [];
  if (!selectedFilter.value) return base;
  const daysAgo = dayjs().subtract(selectedFilter.value, 'day');
  return base.filter(item => dayjs(item.quotationDate).isAfter(daysAgo));
});


const debouncedSearch = _.debounce(() => {
  currentPage.value = 1;
  fetchData();
}, 500);

const fetchData = async () => {
  loading.value = true;
  try {
  const response = await api.get(`/quotation`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        days: selectedFilter.value > 0 ? selectedFilter.value : undefined,
      }
    });
    pagedHistoryList.value = response.data.data; 
    totalPages.value = response.data.totalPages;
    total.value = response.data.total;
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
    fetchData();
  }
}

const adjustItemsPerPage = () => {
  const viewportHeight = window.innerHeight;
  itemsPerPage.value = Math.max(5, Math.floor((viewportHeight - 320) / 55));
};

const goToHistoryDetail = (quotationId) => {
  router.push(`/controller/history/${quotationId}`);
};

const updatePageSize = (n) => {
  const val = Number(n) || itemsPerPage.value;
  if (val === itemsPerPage.value) return;
  itemsPerPage.value = val;
  currentPage.value = 1;
  fetchData();
};

watch(itemsPerPage, () => {
  currentPage.value = 1;
  fetchData();
});

onMounted(() => {
  adjustItemsPerPage();
  fetchData();
  window.addEventListener("resize", _.debounce(adjustItemsPerPage, 300));
});

const exportCsv = async () => {
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedFilter.value) params.days = selectedFilter.value;
  const resp = await api.get(`/quotation/export`, { params, responseType: 'blob' });
    const blob = new Blob([resp.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotations.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to export CSV', e);
  }
};
</script>
