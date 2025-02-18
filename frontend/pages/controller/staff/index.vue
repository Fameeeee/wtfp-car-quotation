<template>
  <div class="layout">
    <AdminSidebar />
    <div class="content">
      <div class="header">
        <div class="title">Staff</div>
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

      <div class="staff-table">
        <div v-if="loading" class="spinner-container">
          <div class="spinner">กำลังโหลด...</div>
        </div>

        <table v-if="!loading">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedStaff.length === 0">
              <td colspan="5" class="no-data">
                <div class="no-data-message">
                  <span>ไม่พบข้อมูล</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="staff in paginatedStaff" :key="staff.id">
              <td>
                <NuxtLink :to="`/controller/staff/${staff.id}`">
                  <img src="/assets/magnifying-glass.png" alt="Details" width="20" />
                </NuxtLink>
              </td>
              <td>{{ staff.id }}</td>
              <td>{{ staff.firstName }}</td>
              <td>{{ staff.lastName }}</td>
              <td>{{ staff.position || 'Staff' }}</td>
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
const staffList = ref([
  { id: 1, firstName: "Arnon", lastName: "Sukom", position: "Manager" },
  { id: 2, firstName: "Assanai", lastName: "Anukulanan", position: "Staff" },
  { id: 3, firstName: "Kittipong", lastName: "Anukularam", position: "Staff" },
  { id: 4, firstName: "Kitti", lastName: "Piso", position: "Staff" },
  { id: 5, firstName: "Nithikorn", lastName: "Bamrungrach", position: "Staff" },
  { id: 6, firstName: "John", lastName: "Doe", position: "Manager" },
  { id: 7, firstName: "Jane", lastName: "Smith", position: "Staff" },
  { id: 8, firstName: "Robert", lastName: "Johnson", position: "Staff" },
  { id: 9, firstName: "Michael", lastName: "Brown", position: "Staff" },
  { id: 10, firstName: "William", lastName: "Davis", position: "Staff" },
  { id: 11, firstName: "David", lastName: "Miller", position: "Manager" },
  { id: 12, firstName: "Richard", lastName: "Wilson", position: "Staff" },
  { id: 13, firstName: "Joseph", lastName: "Moore", position: "Staff" },
  { id: 14, firstName: "Thomas", lastName: "Taylor", position: "Staff" },
  { id: 15, firstName: "Charles", lastName: "Anderson", position: "Staff" },
]);

const itemsPerPage = 12;
const currentPage = ref(1);
const loading = ref(false);

const filteredStaff = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return staffList.value.filter((staff) =>
    staff.id.toString().includes(query) ||
    staff.firstName.toLowerCase().includes(query) ||
    staff.lastName.toLowerCase().includes(query)
  );
});

const paginatedStaff = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredStaff.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredStaff.value.length / itemsPerPage));

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
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchData();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchData();
  }
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

.sidebar-collapsed+.content {
  margin-left: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}

.staff-table {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
}

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

.staff-table img {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 6px;
}

.staff-table img:hover {
  opacity: 1;
  background-color: #e2e8f0;
  transform: scale(1.15);
  cursor: pointer;
}

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

th:nth-child(1),
td:nth-child(1) {
  width: 100px;
  text-align: center;
}

th:nth-child(2),
td:nth-child(2) {
  width: 120px;
}

tbody tr:hover {
  transform: none;
  box-shadow: none;
}

tbody tr:hover td {
  color: inherit;
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

.no-data {
  text-align: center;
  height: 200px;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
}
</style>

