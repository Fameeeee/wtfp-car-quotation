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
          <input type="text" v-model="searchQuery" placeholder="ค้นหา" />
          <button @click="search">
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
              <th>ID</th>
              <th>Date</th>
              <th>Staff Name</th>
              <th>Customer Name</th>
              <th>Car Model</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedHistory.length === 0">
              <td colspan="6" class="no-data">
                <div class="no-data-message">
                  <span>ไม่พบข้อมูล</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="history in paginatedHistory" :key="history.id">
              <td>
                <NuxtLink :to="`/controller/history/${history.id}`">
                  <img src="/assets/magnifying-glass.png" alt="Details" width="20" />
                </NuxtLink>
              </td>
              <td>{{ history.id }}</td>
              <td>{{ history.createAt }}</td>
              <td>{{ history.staffName }}</td>
              <td>{{ history.customerName }}</td>
              <td>{{ history.carModel }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">⬅</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">➡</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: false,
  middleware: "admin-auth",
});

const searchQuery = ref("");
const historyList = ref([
  { id: 1, createAt: "2025-02-01", staffName: "John", customerName: "Arnon Sukom", carModel: "Isuzu MU-X" },
  { id: 2, createAt: "2025-02-02", staffName: "Mash", customerName: "Assanai Anukulanan", carModel: "Isuzu D-Max" },
  { id: 3, createAt: "2025-02-03", staffName: "Lee", customerName: "Kittipong Anukularam", carModel: "Isuzu V-Cross" },
  { id: 4, createAt: "2025-02-04", staffName: "Brown", customerName: "Kitti Piso", carModel: "Isuzu MU-X" },
  { id: 5, createAt: "2025-02-05", staffName: "White", customerName: "Nithikorn Bamrungrach", carModel: "Isuzu D-Max" },
  { id: 6, createAt: "2025-02-06", staffName: "John", customerName: "John Doe", carModel: "Isuzu MU-X" },
  { id: 7, createAt: "2025-02-07", staffName: "Mash", customerName: "Jane Smith", carModel: "Isuzu D-Max" },
  { id: 8, createAt: "2025-02-08", staffName: "Lee", customerName: "Robert Johnson", carModel: "Isuzu V-Cross" },
  { id: 9, createAt: "2025-02-09", staffName: "Brown", customerName: "Michael Brown", carModel: "Isuzu MU-X" },
  { id: 10, createAt: "2025-02-10", staffName: "White", customerName: "William Davis", carModel: "Isuzu D-Max" },
  { id: 11, createAt: "2025-02-11", staffName: "John", customerName: "David Miller", carModel: "Isuzu MU-X" },
  { id: 12, createAt: "2025-02-12", staffName: "Mash", customerName: "Richard Wilson", carModel: "Isuzu D-Max" },
  { id: 13, createAt: "2025-02-13", staffName: "Lee", customerName: "Joseph Moore", carModel: "Isuzu V-Cross" },
  { id: 14, createAt: "2025-02-14", staffName: "Brown", customerName: "Thomas Taylor", carModel: "Isuzu MU-X" },
  { id: 15, createAt: "2025-02-15", staffName: "White", customerName: "Charles Anderson", carModel: "Isuzu D-Max" },
]);

const itemsPerPage = 12;
const currentPage = ref(1);
const loading = ref(false);

const filteredHistory = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return historyList.value.filter((history) =>
    history.id.toString().includes(query) ||
    history.staffName.toLowerCase().includes(query) ||
    history.customerName.toLowerCase().includes(query) ||
    history.carModel.toLowerCase().includes(query)
  );
});

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredHistory.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredHistory.value.length / itemsPerPage));

const search = () => {
  currentPage.value = 1;
  fetchData();
};

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

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

.sidebar-collapsed + .content {
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

/* Simplified table styles */
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  margin-bottom: 20px;
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

