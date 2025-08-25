<template>
  <div class="h-full bg-[#ececec] text-black p-5">
    <div class="flex justify-between items-center py-3 mb-3">
      <div class="text-5xl font-bold text-black">Customer</div>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative w-full max-w-[230px] mb-2">
        <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา" class="w-full pr-4 py-2 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-gray-200
                 bg-white h-10 !pl-3 text-gray-500" />
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-lg flex-1 overflow-auto relative">
    

      <!-- Table -->
      <div class="overflow-x-auto">
        <table v-if="!loading" class="w-full border-collapse min-w-[700px] border-spacing-0 table-fixed">
          <thead>
            <tr>
              <th></th>
              <th>ไอดี</th>
              <th>ชื่อจริง</th>
              <th>นามสกุล</th>
              <th>เบอร์โทรศัพท์</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="customerList.length === 0">
              <td class="text-center h-[200px]">
                <div class="flex flex-col items-center justify-center gap-3 p-10 text-gray-400">
                  <span class="text-base font-medium">ไม่พบข้อมูล</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="customer in customerList" :key="customer.id"
              class="odd:bg-white even:bg-gray-50 transition-colors duration-200 hover:bg-gray-100">
              <td class="px-4 py-2 text-[#334155] border-b border-[#f1f4f9] text-[0.95rem]">
                <NuxtLink :to="`/controller/customer/${customer.id}`" class="inline-flex">
                  <svg
                    class="w-6 h-6 rounded-md opacity-70 hover:opacity-100 hover:bg-gray-200 hover:scale-110 transition-all cursor-pointer"
                    fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z"
                      fill="black" />
                  </svg>

                </NuxtLink>
              </td>
              <td>{{ customer.id }}</td>
              <td>{{ customer.firstName }}</td>
              <td>{{ customer.lastName }}</td>
              <td>{{ customer.phoneNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
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
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import _ from 'lodash';

definePageMeta({
  layout: 'admin',
  middleware: "admin-auth",
});

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const searchQuery = ref("");
const customerList = ref([]);
const itemsPerPage = 8;
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);

const debouncedSearch = _.debounce((event) => {
  searchHistory();
}, 500);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${backendUrl}/customer`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        search: searchQuery.value
      }
    });

    customerList.value = response.data.data;
    totalPages.value = response.data.totalPages;
    total.value = response.data.total;
  } catch (error) {
    console.error("Error fetching staff data:", error);
  } finally {
    loading.value = false;
  }
}

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