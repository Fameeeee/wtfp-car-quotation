<template>
  <div class="layout">
    <AdminSidebar />
    <div class="content">
      <div class="header">
        <div class="title">History</div>
      </div>
      <div class="table-controls">
        <button class="filter-button">
          <img src="/assets/sort.png" alt="Filter" />
          Filter
        </button>
        <div class="search-bar">
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา" />
          <button @click="searchHistory">
            <img src="/assets/magnifying-glass.png" alt="Search" width="20" />
          </button>
        </div>
      </div>

      <div class="history-table">
        <div v-if="loading" class="spinner-container">
          <div class="spinner">กำลังโหลด...</div>
        </div>

        <table v-if="!loading">
          <thead>
            <tr>
              <th></th>
              <th>ไอดี</th>
              <th>วันที่</th>
              <th>ชื่อพนักงาน</th>
              <th>ชื่อลูกค้า</th>
              <th>รุ่นรถ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="historyList.length === 0">
              <td colspan="6" class="no-data">
                <div class="no-data-message">
                  <span>ไม่พบข้อมูล</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="history in historyList" :key="history.id">
              <td>
                <NuxtLink :to="`/controller/history/${history.id}`">
                  <img src="/assets/magnifying-glass.png" alt="Details" width="20" />
                </NuxtLink>
              </td>
              <td>{{ history.id }}</td>
              <td>{{ history.quotationDate }}</td>
              <td>{{ history.staff.firstName }}</td>
              <td>{{ history.customer.firstName }}</td>
              <td>{{ history.carDetails.modelGName }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">⬅</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">➡</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import _ from 'lodash';

definePageMeta({
  layout: false,
  middleware: "admin-auth",
});

const searchQuery = ref("");
const historyList = ref([]);
const itemsPerPage = 12;
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
  } catch (error) {
    console.error("Error fetching history data:", error);
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
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 100%;
  min-height: 400px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
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

tbody tr:hover {
  background-color: #f8fafc;
}

/* Magnifying glass icon styles */
.history-table img {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 6px;
}

.history-table img:hover {
  opacity: 1;
  background-color: #e2e8f0;
  transform: scale(1.15);
  cursor: pointer;
}

/* Enhanced pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination button {
  padding: 8px 16px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 38px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.pagination button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
}

.pagination button:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination span {
  color: #475569;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0 8px;
  min-width: 120px;
  text-align: center;
}

/* Loading state styles */
.spinner-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  color: #3b82f6;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.spinner::before {
  content: '';
  display: block;
  width: 20px;
  height: 20px;
  border: 3px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Column specific widths */
th:nth-child(1),
td:nth-child(1) {
  width: 100px;
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  width: 120px;
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
  border: none;
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

.magnifying-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.no-data {
  text-align: center;
  height: 200px;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #94a3b8;
}

.no-data-message img {
  opacity: 0.5;
}

.no-data-message span {
  font-size: 1rem;
  font-weight: 500;
}
</style>
