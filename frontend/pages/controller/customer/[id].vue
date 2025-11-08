<template>
  <div class="min-h-screen bg-[#F5F5F5] text-black">
    <!-- Sticky header -->
    <header class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="h-9 px-3 rounded-md border text-sm hover:bg-gray-100 transition-colors">
            กลับ
          </button>
          <h1 class="text-2xl font-bold">รายละเอียดลูกค้า</h1>
        </div>
        <div v-if="customerData" class="text-sm text-gray-600">
          รหัสลูกค้า: {{ customerData.id }}
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Loading skeleton -->
      <div v-if="loading" class="animate-pulse">
        <div class="bg-white rounded-lg p-6 mb-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-6 bg-gray-200 rounded w-1/3"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-6">
          <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Customer info card -->
      <div v-else-if="customerData" class="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div class="flex items-start gap-6">
          <!-- Avatar -->
          <div class="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
            {{ customerData.firstName?.charAt(0) }}{{ customerData.lastName?.charAt(0) }}
          </div>
          
          <!-- Customer details -->
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ customerData.firstName }} {{ customerData.lastName }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">อีเมล:</span>
                  <span class="font-medium">{{ customerData.email || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">เบอร์โทร:</span>
                  <span class="font-medium">{{ customerData.phoneNumber || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">เพศ:</span>
                  <span class="font-medium">{{ customerData.gender || '-' }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">อายุ:</span>
                  <span class="font-medium">{{ customerData.age || '-' }} ปี</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">จังหวัด:</span>
                  <span class="font-medium">{{ customerData.city || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 w-20">ใบเสนอราคา:</span>
                  <span class="font-bold text-green-600">{{ filteredQuotations.length }} รายการ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quotations section -->
      <div v-if="customerData" class="bg-white rounded-lg border shadow-sm">
        <!-- Search header -->
        <div class="sticky top-[73px] z-10 bg-white/95 backdrop-blur border-b border-gray-100 p-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 class="text-lg font-semibold text-gray-900">ใบเสนอราคา</h3>
            <div class="flex items-center gap-3">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  @input="debouncedSearch"
                  type="text"
                  placeholder="ค้นหาใบเสนอราคา..."
                  class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Quotations table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รุ่นรถ</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การชำระ</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="paginatedQuotations.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>ไม่มีใบเสนอราคา</span>
                  </div>
                </td>
              </tr>
              <tr v-for="quotation in paginatedQuotations" :key="quotation.id" 
                  class="hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="goToHistory(quotation.id)">
                <td class="px-4 py-3 text-sm font-medium text-green-600">{{ quotation.id }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ quotation.quotationDate ? dayjs(quotation.quotationDate).format('DD/MM/YYYY') : '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ quotation.carDetails?.modelClass || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        :class="quotation.paymentMethod === 'cash' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'">
                    {{ quotation.paymentMethod === 'cash' ? 'เงินสด' : 'ผ่อนชำระ' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <button @click.stop="goToHistory(quotation.id)"
                          class="text-green-600 hover:text-green-800 font-medium transition-colors">
                    ดูรายละเอียด
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredQuotations.length > 0" class="border-t border-gray-200 p-4">
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
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useApi } from '~/composables/useApi';
import _ from 'lodash';
import dayjs from 'dayjs';
import Pagination from "~/components/common/Pagination.vue";

const config = useRuntimeConfig()
const api = useApi();

const route = useRoute();
const router = useRouter();
const customerId = route.params.id;

const customerData = ref(null);
const loading = ref(true);
const searchQuery = ref("");
const itemsPerPage = ref(6);
const currentPage = ref(1);

const debouncedSearch = _.debounce(() => {
  currentPage.value = 1;
}, 400);

const fetchCustomerData = async () => {
  loading.value = true;
  try {
  const response = await api.get(`/customer/${customerId}`);
    // New response structure: { statusCode, message, data: {...} }
    customerData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
  } finally {
    loading.value = false;
  }
};

const filteredQuotations = computed(() => {
  if (!customerData.value?.quotations) return [];
  if (!searchQuery.value) return customerData.value.quotations;

  const q = searchQuery.value.toLowerCase();
  return customerData.value.quotations.filter(qu => {
    return (
      String(qu.id).includes(q) ||
      qu.carDetails?.modelClass?.toLowerCase().includes(q) ||
      dayjs(qu.quotationDate).format("DD/MM/YYYY").includes(q)
    );
  });
});


const paginatedQuotations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredQuotations.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredQuotations.value.length / itemsPerPage.value))
);


const goBack = () => {
  router.push('/controller/customer');
};

const goToHistory = (quotationId) => {
  router.push(`/controller/history/${quotationId}`);
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const updatePageSize = (n) => {
  const val = Number(n) || itemsPerPage.value;
  if (val === itemsPerPage.value) return;
  itemsPerPage.value = val;
  currentPage.value = 1;
};

const adjustItemsPerPage = () => {
  const viewportHeight = window.innerHeight;
  itemsPerPage.value = Math.max(5, Math.floor((viewportHeight - 450) / 55));
};

onMounted(() => {
  fetchCustomerData();
  adjustItemsPerPage();
  window.addEventListener("resize", adjustItemsPerPage);
});

definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin'
});
</script>
