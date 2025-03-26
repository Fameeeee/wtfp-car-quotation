<template>
  <div class="flex min-h-screen bg-[#ececec] w-full">
    <AdminSidebar />
    <div class="content flex flex-col flex-1" style="padding: 20px;">
      <div class="header flex justify-between items-center px-5 py-2.5"
        style="padding-inline: 20px; padding-block: 10px;">
        <div class="text-6xl">Customer</div>
      </div>
      <div class="customer-table  bg-white p-5 rounded-lg shadow-md relative min-h-[300px] overflow-hidden"
        style=" border-collapse:collapse ; margin-top: 10px; width: 100%;">
        <div class=" back mb-4">
          <button @click="goBack" class="w-24 h-10 bg-red-600 text-white  rounded-md mb-2 "
            style="margin-bottom: 10px;">
            < กลับ </button>
        </div>
        <div class="customer bg-[#ECECEC] rounded-lg p-2.5 flex gap-2.5">
          <div class="customer-img  h-[150px] bg-white w-[150px] flex justify-center items-center">
            <svg width=" 100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.71 12.71C16.6904 11.9387 17.406 10.8809 17.7572 9.68394C18.1085 8.48697 18.0779 7.21027 17.6698 6.03147C17.2617 4.85267 16.4963 3.83039 15.4801 3.10686C14.4639 2.38332 13.2474 1.99451 12 1.99451C10.7525 1.99451 9.53611 2.38332 8.51993 3.10686C7.50374 3.83039 6.73834 4.85267 6.33021 6.03147C5.92208 7.21027 5.89151 8.48697 6.24276 9.68394C6.59401 10.8809 7.3096 11.9387 8.29 12.71C6.61007 13.383 5.14428 14.4994 4.04889 15.9399C2.95349 17.3805 2.26956 19.0913 2.07 20.89C2.05555 21.0213 2.06711 21.1542 2.10402 21.2811C2.14093 21.4079 2.20246 21.5263 2.28511 21.6293C2.45202 21.8375 2.69478 21.9708 2.96 22C3.22521 22.0292 3.49116 21.9518 3.69932 21.7849C3.90749 21.618 4.04082 21.3752 4.07 21.11C4.28958 19.1552 5.22168 17.3498 6.68822 16.0388C8.15475 14.7278 10.0529 14.003 12.02 14.003C13.9871 14.003 15.8852 14.7278 17.3518 16.0388C18.8183 17.3498 19.7504 19.1552 19.97 21.11C19.9972 21.3557 20.1144 21.5827 20.2991 21.747C20.4838 21.9114 20.7228 22.0015 20.97 22H21.08C21.3421 21.9698 21.5817 21.8373 21.7466 21.6313C21.9114 21.4252 21.9881 21.1624 21.96 20.9C21.7595 19.0962 21.0719 17.381 19.9708 15.9382C18.8698 14.4954 17.3969 13.3795 15.71 12.71ZM12 12C11.2089 12 10.4355 11.7654 9.77772 11.3259C9.11992 10.8864 8.60723 10.2616 8.30448 9.53074C8.00173 8.79983 7.92251 7.99557 8.07686 7.21964C8.2312 6.44372 8.61216 5.73099 9.17157 5.17158C9.73098 4.61217 10.4437 4.2312 11.2196 4.07686C11.9956 3.92252 12.7998 4.00173 13.5307 4.30448C14.2616 4.60724 14.8863 5.11993 15.3259 5.77772C15.7654 6.43552 16 7.20888 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12Z"
                fill="#1E1E1E" />
            </svg>
          </div>
          <div class="ml-4 bg-[#ECECEC] p-2.5">
            <div v-if="loading" class="text-gray-500">Loading customer details...</div>
            <div v-else-if="customerData">
              <div class="row-1 flex gap-3.5 my-1.5 text-xl font-bold">
                {{ customerData.firstName }} {{ customerData.lastName }}
              </div>
            </div>
          </div>
        </div>
        <hr class="border-black" style="margin: 10px;">
        <div class="table-controls flex items-center mb-2.5">
          <div class="relative w-full max-w-[230px]">
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา"
              class="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white h-10 !pl-3" />
          </div>
        </div>
        <div class="customer-data">
          <table v-if="customerData && customerData.quotations.length"
            class=" w-full border-collapse mt-2 customer-table">
            <thead>
              <tr class="bg-gray-100 font-bold text-center">
                <th class="border text-left border-gray-300 p-2">ID</th>
                <th class="border text-left border-gray-300 p-2">วันที่</th>
                <th class="border text-left border-gray-300 p-2">ใบเสนอราคา</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(quotation, index) in customerData.quotations" :key="index" @click="goToHistory(quotation.id)"
                class="hover:bg-gray-200 cursor-pointer clickable-row">
                <td class="border border-gray-300 p-2 text-center">{{ quotation.id }}</td>
                <td class="border border-gray-300 p-2 text-center">{{ quotation.quotationDate }}</td>
                <td class="border border-gray-300 p-2 text-center">{{ quotation.carDetails.modelClass }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>ไม่มีข้อมูลใบเสนอราคา</p>
        </div>
        <div class="flex justify-center items-center gap-4 mt-6" >
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
  </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const customerId = route.params.id;
const customerData = ref(null);
const loading = ref(true);
const searchQuery = ref("");

const fetchcustomerData = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/customer/${customerId}`);
    customerData.value = response.data;
    console.log(customerData.value)
  } catch (error) {
    console.error("Error fetching customer data:", error);
  } finally {
    loading.value = false
  }
};

const goBack = () => {
  router.push('/controller/customer');
};

const goToHistory = (quotationId) => {
  router.push(`/controller/history/${quotationId}`);
};

onMounted(() => {
  fetchcustomerData();
});

definePageMeta({
  middleware: 'admin-auth',
  layout: false
});
</script>

<style scoped>
.customer-table th,
.customer-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.customer-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.customer-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.customer-table tr:hover {
  background-color: #e0e0e0;
  cursor: pointer;
}

.sidebar-collapsed+.content {
  margin-left: 80px;
}


.customer-table {
  background: white;
  padding: 20px;
  position: relative;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
}

.back-btn {
  width: 100px;
  height: 40px;
  background: #E83842;
  color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin-bottom: 10px;
}

.customer {
  background: #ECECEC;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  gap: 10px;
}

.action-btn {
  background: #7bff29;
}

.pagination {
  background: #ff70bf;
}

.row-1,
.row-2,
.row-3 {
  display: flex;
  gap: 15px;
  margin: 5px 0;
}

.row-1 {
  font-size: 22px;
  font-weight: bold;
}

.row-2,
.row-3 {
  font-size: 18px;
}

.table-controls {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
