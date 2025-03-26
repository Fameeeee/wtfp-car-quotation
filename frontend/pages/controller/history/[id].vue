<template>
  <div class="layout">
    <AdminSidebar />
    <div class="content">
      <div class="header">
        <div class="title">History</div>
      </div>
      <div class="history-table">
        <div class="back">
          <button @click="goBack" class="back-btn">
            < กลับ</button>
        </div>
        <div class="history">
          <div class="ml-4 bg-[#ECECEC] p-2.5">
            <div v-if="loading" class="text-gray-500">Loading customer details...</div>
            <div v-else-if="historyData">
              <div class="row-1 flex gap-3.5 my-1.5 text-xl font-bold">
                {{ historyData?.customer.firstName }} {{ historyData?.customer.firstName }}
              </div>
            </div>
            <div v-else>
              <p>No detail found.</p>
            </div>
          </div>
        </div>
        <hr class="border-black my-2.5">
        <div class="history-data space-y-2.5">
          <p><strong>ชื่อพนักงาน:</strong> {{ historyData?.staff.firstName }}</p>
          <p><strong>ชนิดรถ:</strong> {{ historyData?.carDetails?.unitType }}</p>
          <p><strong>รุ่นปี:</strong> {{ historyData?.carDetails?.modelClass }}</p>
          <p><strong>รหัสแบบรถ:</strong> {{ historyData?.carDetails?.modelCodeName }}</p>
          <p><strong>รหัสแบบรถทั่วไป:</strong> {{ historyData?.carDetails?.modelGName }}</p>
          <p><strong>ราคา:</strong> {{ historyData?.carDetails?.price }}</p>
          <p><strong>สีรถ:</strong> {{ historyData?.carDetails?.color }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from "axios";

const route = useRoute();
const router = useRouter();
const quotationId = route.params.id;
const historyData = ref(null);
const staffData = ref(null);
const loading = ref(true);
const searchQuery = ref("");
const customerId = route.params.id;
const staffId = route.params.id;
const customerData = ref(null);

const fetchHistoryData = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/quotation/${quotationId}`);
    historyData.value = response.data;
    console.log(historyData.value)
  } catch (error) {
    console.error("Error fetching history data:", error);
  } finally {
    loading.value = false;
  }
};

const fetchStaffData = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/staff/${staffId}`);
    staffData.value = response.data;
    // console.log(staffData.value)
  } catch (error) {
    console.error("Error fetching staff data:", error);
  } finally {
    loading.value = false;
  }
};

const fetchcustomerData = async () => {
  try {
    const response = await axios.get(`http://localhost:3001/customer/${customerId}`);
    customerData.value = response.data;
    // console.log(customerData.value)
  } catch (error) {
    console.error("Error fetching customer data:", error);
  } finally {
    loading.value = false
  }
};

const goBack = () => {
  router.push('/controller/history');
};

const goToHistory = (quotationId) => {
  router.push(`/controller/history/${quotationId}`);
};

onMounted(() => {
  fetchHistoryData();
  fetchStaffData();
  fetchcustomerData();
});

definePageMeta({
  middleware: 'admin-auth',
  layout: false
});
</script>


<style scoped>
.history-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.history-table th,
.history-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.history-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.history-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.history-table tr:hover {
  background-color: #e0e0e0;
  cursor: pointer;
}

.clickable-row {
  cursor: pointer;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

hr {
  margin: 10px 0;
}

.layout {
  display: flex;
  min-height: 100vh;
  background: #ececec;
  width: 100vw;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex: 1;
}

.title {
  font-size: 3rem;
}

.sidebar-collapsed+.content {
  margin-left: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.history-table {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

.history {
  background: #ECECEC;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  gap: 10px;
}

.history-img {
  height: 150px;
  background: white;
  width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.history-details {
  background: #ECECEC;
  padding: 10px;
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

.filter-button {
  background: #fff;
  border: 1px solid #0000001A;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 5px;
  margin-right: 10px;
  transition: all 0.3s ease;
  height: 40px;
}

.filter-button img {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}

.filter-button:hover {
  color: white;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.search-bar input {
  padding: 5px 10px;
  outline: none;
  border-radius: 5px;
  width: 200px;
  font-size: 1rem;
}

.search-bar button {
  padding: 5px;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 5px;
}
</style>
