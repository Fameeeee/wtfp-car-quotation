<template>
  <div class="h-full bg-[#ececec] text-black p-4 md:p-5">
    <!-- Header -->
    <div class="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 bg-[#ececec] pb-3">
      <h1 class="text-2xl md:text-3xl font-semibold">พนักงาน</h1>
      <div class="mt-3 max-w-xs">
        <div class="relative">
          <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหาชื่อ, สาขา, ตำแหน่ง..."
                 class="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 2C9.1446 2.00012 7.80887 2.32436 6.60427 2.94569C5.39966 3.56702 4.3611 4.46742 3.57525 5.57175C2.78939 6.67609 2.27902 7.95235 2.08672 9.29404C1.89442 10.6357 2.02576 12.004 2.46979 13.2846C2.91382 14.5652 3.65766 15.7211 4.63925 16.6557C5.62084 17.5904 6.81171 18.2768 8.11252 18.6576C9.41333 19.0384 10.7864 19.1026 12.117 18.8449C13.4477 18.5872 14.6975 18.015 15.762 17.176L19.414 20.828C19.6026 21.0102 19.8552 21.111 20.1174 21.1087C20.3796 21.1064 20.6304 21.0012 20.8158 20.8158C21.0012 20.6304 21.1064 20.3796 21.1087 20.1174C21.111 19.8552 21.0102 19.6026 20.828 19.414L17.176 15.762C18.164 14.5086 18.7792 13.0024 18.9511 11.4157C19.123 9.82905 18.8448 8.22602 18.1482 6.79009C17.4517 5.35417 16.3649 4.14336 15.0123 3.29623C13.6597 2.44911 12.096 1.99989 10.5 2ZM4.00001 10.5C4.00001 8.77609 4.68483 7.12279 5.90382 5.90381C7.1228 4.68482 8.7761 4 10.5 4C12.2239 4 13.8772 4.68482 15.0962 5.90381C16.3152 7.12279 17 8.77609 17 10.5C17 12.2239 16.3152 13.8772 15.0962 15.0962C13.8772 16.3152 12.2239 17 10.5 17C8.7761 17 7.1228 16.3152 5.90382 15.0962C4.68483 13.8772 4.00001 12.2239 4.00001 10.5Z" fill="currentColor"/></svg>
        </div>
      </div>
    </div>

    <!-- List (table) -->
    <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm">
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 8" :key="i" class="h-12 rounded bg-gray-100 animate-pulse"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัส</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">นามสกุล</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จังหวัด/สาขา</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตำแหน่ง</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="staffList.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>ไม่มีข้อมูลพนักงาน</span>
                </div>
              </td>
            </tr>
            <tr v-else v-for="s in staffList" :key="s.id" 
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @click="goToStaffDetail(s.id)">
              <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ s.id }}</td>
              <td class="px-4 py-3 text-sm text-gray-900">{{ s.firstName }}</td>
              <td class="px-4 py-3 text-sm text-gray-900">{{ s.lastName }}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{{ s.city || s.branch || '—' }}</td>
              <td class="px-4 py-3 text-sm">
                <div v-if="isManagerUser">
                  <select :value="s.role || 'staff'" @click.stop @change.stop="onChangeRole($event, s)" class="text-sm border rounded px-2 py-1">
                    <option value="staff">พนักงาน</option>
                    <option value="manager">ผู้จัดการ</option>
                    <option value="admin">แอดมิน</option>
                  </select>
                </div>
                <div v-else>
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {{ s.role || 'พนักงาน' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <div v-if="isManagerUser">
                  <select :value="s.status || 'active'" @click.stop @change.stop="onChangeStatus($event, s)" class="text-sm border rounded px-2 py-1">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>
                <div v-else>
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {{ s.status || 'active' }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <button @click.stop="goToStaffDetail(s.id)"
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
    <div v-if="staffList.length > 0">
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
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router';
import { useApi } from '~/composables/useApi'
import _ from 'lodash';
import { isManager } from '~/composables/useAuth'
const { $axios } = useNuxtApp();
import Pagination from "~/components/common/Pagination.vue";

definePageMeta({
  layout: 'admin',
  middleware: "admin-auth",
});

const router = useRouter();
const api = useApi();

const searchQuery = ref("");
const staffList = ref([]);
const itemsPerPage = ref(8);
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const loading = ref(false);


const debouncedSearch = _.debounce(() => {
  searchHistory();
}, 500);

const fetchData = async () => {
  loading.value = true;
    try {
    const response = await api.get(`/staff`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value
      }
    });
    staffList.value = response.data.data;
    totalPages.value = response.data.totalPages;
    total.value = response.data.total;
  } catch (error) {
    console.error("Error fetching staff data:", error);
  } finally {
    loading.value = false;
  }
};

const searchHistory = () => {
  currentPage.value = 1;
  fetchData();
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchData();
  }
};

const adjustItemsPerPage = () => {
  const viewportHeight = window.innerHeight;
  itemsPerPage.value = Math.max(5, Math.floor((viewportHeight - 320) / 55));
};

const goToStaffDetail = (staffId) => {
  router.push(`/controller/staff/${staffId}`);
};

watch(itemsPerPage, () => {
  currentPage.value = 1;
  fetchData();
});

onMounted(() => {
  adjustItemsPerPage();
  fetchData();
  window.addEventListener("resize", adjustItemsPerPage);
});

const updatePageSize = (n) => {
  const val = Number(n) || itemsPerPage.value;
  if (val === itemsPerPage.value) return;
  itemsPerPage.value = val;
  currentPage.value = 1;
  fetchData();
};

// manager flag for UI
const isManagerUser = isManager();

const onChangeRole = async (event, staff) => {
  const newRole = event.target.value;
  const prev = staff.role;
  // optimistic update
  staff.role = newRole;
  try {
  await api.patch(`/staff/${staff.id}/role`, { role: newRole });
  } catch (e) {
    console.error('Failed to update role', e);
    staff.role = prev; // revert
    alert('ไม่สามารถอัปเดตตำแหน่งได้');
  }
}

const onChangeStatus = async (event, staff) => {
  const newStatus = event.target.value;
  const prev = staff.status;
  staff.status = newStatus;
  try {
  const res = await api.patch(`/staff/${staff.id}/status`, { status: newStatus });
  // refresh list from server to confirm persisted change
  await fetchData();
  } catch (e) {
    console.error('Failed to update status', e);
    staff.status = prev;
  const msg = e?.response?.data?.message || e?.message || 'ไม่สามารถอัปเดตสถานะได้';
  alert(msg);
  }
}
</script>