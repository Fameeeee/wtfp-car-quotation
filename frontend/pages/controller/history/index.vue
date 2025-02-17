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
              <th>Create At</th>
              <th>Staff Name</th>
              <th>Customer Name</th>
              <th>Car Model</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="history in paginatedHistory" :key="history.id">
              <td>
                <NuxtLink :to="`/controller/history/${history.id}`">
                  <img src="/assets/magnifying-glass.png" alt="View Customer" class="magnifying-icon"/>
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
  { id: 2, createAt: "2025-02-02", staffName: "mash", customerName: "Assanai Anukulanan", carModel: "Isuzu D-Max" },
  { id: 3, createAt: "2025-02-03", staffName: "Lee", customerName: "Kittipong Anukularam", carModel: "Isuzu V-Cross" },
  { id: 4, createAt: "2025-02-04", staffName: "Brown", customerName: "Kitti Piso", carModel: "Isuzu MU-X" },
  { id: 5, createAt: "2025-02-05", staffName: "White", customerName: "Nithikorn Bamrungrach", carModel: "Isuzu D-Max" },
]);

const itemsPerPage = 13;
const currentPage = ref(1);
const loading = ref(false);

const filteredHistory = computed(() => {
  return historyList.value.filter((history) =>
    history.customerName.toLowerCase().includes(searchQuery.value.toLowerCase())
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
  font-size: 3vw;
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
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #f4f4f4;
  border-right: 1px solid #0000001A;
  white-space: nowrap;
  word-wrap: break-word;
}

th:last-child,
td:last-child {
  border-right: none;
}

th {
  background: #f4f4f4;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.pagination button {
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  background: #007bff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.spinner-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.history-table img {
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.history-table img:hover {
  opacity: 1;
}

th:nth-child(1),
td:nth-child(1) {
  text-align: center;
  padding-right: 8px;
  width: 80px;
}

th:nth-child(2),
td:nth-child(2) {
  padding-left: 8px;
  width: 100px;
}

th:nth-child(3),
td:nth-child(3),
th:nth-child(4),
td:nth-child(4),
th:nth-child(5),
td:nth-child(5) {
  padding-left: 20px;
  text-align: left;
}

th:nth-child(6),
td:nth-child(6) {
  padding-left: 20px;
  text-align: left;
}
</style>

