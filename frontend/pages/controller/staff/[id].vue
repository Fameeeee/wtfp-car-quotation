<template>
    <div class="min-h-screen bg-[#F5F5F5] text-black">
        <!-- Sticky header -->
        <header class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
            <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <button @click="goBack"
                        class="h-9 px-3 rounded-md border text-sm hover:bg-gray-100 transition-colors">
                        กลับ
                    </button>
                    <h1 class="text-2xl font-bold">รายละเอียดพนักงาน</h1>
                </div>
                <div v-if="staffData" class="text-sm text-gray-600">
                    รหัสพนักงาน: {{ staffData.id }}
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

            <!-- Staff info card -->
            <div v-else-if="staffData" class="bg-white rounded-lg border shadow-sm p-6 mb-6">
                <div class="flex items-start gap-6">
                    <!-- Avatar -->
                    <div
                        class="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
                        {{ staffData.firstName?.charAt(0) }}{{ staffData.lastName?.charAt(0) }}
                    </div>

                    <!-- Staff details -->
                    <div class="flex-1 min-w-0">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">
                            {{ staffData.firstName }} {{ staffData.lastName }}
                        </h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">อีเมล:</span>
                                    <span class="font-medium">{{ staffData.email || '-' }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">เบอร์โทร:</span>
                                    <span class="font-medium">{{ staffData.phoneNumber || '-' }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">เพศ:</span>
                                    <span class="font-medium">{{ staffData.gender || '-' }}</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">ตำแหน่ง:</span>
                                    <div v-if="isManagerUser">
                                        <select :value="staffData.role || 'staff'"
                                            @change.stop="onChangeRoleSingle($event)"
                                            class="text-sm border rounded px-2 py-1">
                                            <option value="staff">พนักงาน</option>
                                            <option value="manager">ผู้จัดการ</option>
                                            <option value="admin">แอดมิน</option>
                                        </select>
                                    </div>
                                    <div v-else>
                                        <span
                                            class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {{ staffData.role || 'พนักงาน' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">สถานะ:</span>
                                    <div v-if="isManagerUser">
                                        <select :value="staffData.status || 'active'"
                                            @change.stop="onChangeStatusSingle($event)"
                                            class="text-sm border rounded px-2 py-1">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="terminated">Terminated</option>
                                            <option value="unemployed">Unemployed</option>
                                        </select>
                                    </div>
                                    <div v-else>
                                        <span
                                            class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                            {{ staffData.status || 'active' }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">จังหวัด:</span>
                                    <span class="font-medium">{{ staffData.city || '-' }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-500 w-20">สาขา:</span>
                                    <span class="font-medium">{{ staffData.branch || '-' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center gap-2">
                            <span class="text-gray-500">ใบเสนอราคา:</span>
                            <span class="font-bold text-blue-600">{{ filteredQuotations.length }} รายการ</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quotations section -->
            <div v-if="staffData" class="bg-white rounded-lg border shadow-sm">
                <!-- Search header -->
                <div class="sticky top-[73px] z-10 bg-white/95 backdrop-blur border-b border-gray-100 p-4">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h3 class="text-lg font-semibold text-gray-900">ใบเสนอราคา</h3>
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <input v-model="searchQuery" @input="debouncedSearch" type="text"
                                    placeholder="ค้นหาใบเสนอราคา..."
                                    class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    รหัส</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ลูกค้า</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    รุ่นรถ</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    การชำระ</th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-if="paginatedQuotations.length === 0">
                                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                                    <div class="flex flex-col items-center gap-2">
                                        <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>ไม่มีใบเสนอราคา</span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-for="quotation in paginatedQuotations" :key="quotation.id"
                                class="hover:bg-gray-50 transition-colors cursor-pointer"
                                @click="goToHistory(quotation.id)">
                                <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ quotation.id }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">
                                    {{ quotation.customer?.firstName }} {{ quotation.customer?.lastName }}
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ quotation.carDetails?.modelClass || '-'
                                    }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">
                                    {{ quotation.quotationDate ? new
                                        Date(quotation.quotationDate).toLocaleDateString('th-TH') : '-' }}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full" :class="quotation.paymentMethod === 'cash'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'">
                                        {{ quotation.paymentMethod === 'cash' ? 'เงินสด' : 'ผ่อนชำระ' }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <button @click.stop="goToHistory(quotation.id)"
                                        class="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                                        ดูรายละเอียด
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="filteredQuotations.length > 0" class="border-t border-gray-200 p-4">
                    <Pagination :page="currentPage" :total-pages="totalPages" :show-page-size="true"
                        :page-size="itemsPerPage" @update:page="changePage" @update:pageSize="updatePageSize" />
                </div>
            </div>
        </main>
    </div>

    <!-- Confirmation Modal for Role Change -->
    <div v-if="showRoleModal" class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">ยืนยันการเปลี่ยนตำแหน่ง</h3>
            <p class="text-sm text-gray-600 mb-4">
                คุณต้องการเปลี่ยนตำแหน่งของ <span class="font-semibold">{{ staffData?.firstName }} {{
                    staffData?.lastName }}</span>
                เป็น <span class="font-semibold text-blue-600">{{ getRoleLabel(pendingRoleChange) }}</span> ใช่หรือไม่?
            </p>
            <div class="flex gap-3 justify-end">
                <button @click="cancelRoleChange"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    ยกเลิก
                </button>
                <button @click="confirmRoleChange"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    ยืนยัน
                </button>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal for Status Change -->
    <div v-if="showStatusModal" class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div class="bg-white p-6 rounded-xl shadow-lg max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">ยืนยันการเปลี่ยนสถานะ</h3>
            <p class="text-sm text-gray-600 mb-4">
                คุณต้องการเปลี่ยนสถานะของ <span class="font-semibold">{{ staffData?.firstName }} {{
                    staffData?.lastName }}</span>
                เป็น <span class="font-semibold text-blue-600">{{ getStatusLabel(pendingStatusChange) }}</span> ใช่หรือไม่?
            </p>
            <div class="flex gap-3 justify-end">
                <button @click="cancelStatusChange"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors">
                    ยกเลิก
                </button>
                <button @click="confirmStatusChange"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    ยืนยัน
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import { useApi } from '~/composables/useApi'
import _ from 'lodash';
import Pagination from "~/components/common/Pagination.vue";
import { isManager } from '~/composables/useAuth.ts'
import { useNotification } from '~/composables/useNotification';
const { $axios } = useNuxtApp();

const api = useApi();
const toast = useNotification();

const route = useRoute();
const router = useRouter();
const staffId = route.params.id;

const staffData = ref(null);
const loading = ref(true);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(6);
const showRoleModal = ref(false);
const showStatusModal = ref(false);
const pendingRoleChange = ref(null);
const pendingStatusChange = ref(null);
const previousRole = ref(null);
const previousStatus = ref(null);

const debouncedSearch = _.debounce(() => {
    currentPage.value = 1;
}, 400);

const fetchStaffData = async () => {
    loading.value = true;
    try {
        const response = await api.get(`/staff/${staffId}`);
        // New response structure: { statusCode, message, data: {...} }
        staffData.value = response.data.data;
    } catch (error) {
        console.error("Error fetching staff data:", error);
        toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้');
    } finally {
        loading.value = false;
    }
};

const filteredQuotations = computed(() => {
    if (!staffData.value?.quotations) return [];
    if (!searchQuery.value) return staffData.value.quotations;

    const q = searchQuery.value.toLowerCase();
    return staffData.value.quotations.filter(qu => {
        return (
            String(qu.id).includes(q) ||
            qu.customer?.firstName?.toLowerCase().includes(q) ||
            qu.customer?.lastName?.toLowerCase().includes(q) ||
            qu.carDetails?.modelClass?.toLowerCase().includes(q) ||
            (qu.customer?.firstName + ' ' + qu.customer?.lastName)?.toLowerCase().includes(q)
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

const goBack = () => {
    router.push('/controller/staff');
};

const goToHistory = (quotationId) => {
    router.push(`/controller/history/${quotationId}`);
};

onMounted(() => {
    fetchStaffData();
    adjustItemsPerPage();
    window.addEventListener("resize", adjustItemsPerPage);
});

definePageMeta({
    middleware: 'staff-auth',
    layout: 'admin'
});

const isManagerUser = isManager();

const onChangeRoleSingle = async (event) => {
    const newRole = event.target.value;
    if (newRole === staffData.value.role) return;
    
    // Store pending change and show modal
    previousRole.value = staffData.value.role;
    pendingRoleChange.value = newRole;
    showRoleModal.value = true;
    
    // Reset select to old value (will update on confirm)
    event.target.value = staffData.value.role;
};

const confirmRoleChange = async () => {
    const newRole = pendingRoleChange.value;
    const prev = previousRole.value;
    staffData.value.role = newRole;
    showRoleModal.value = false;
    
    try {
        await api.patch(`/staff/${staffId}/role`, { role: newRole });
        toast.success(`เปลี่ยนตำแหน่งเป็น ${getRoleLabel(newRole)} แล้ว`);
        await fetchStaffData();
    } catch (e) {
        console.error('Failed to update role', e);
        staffData.value.role = prev;
        toast.apiError(e, 'ไม่สามารถอัปเดตตำแหน่งได้');
    } finally {
        pendingRoleChange.value = null;
        previousRole.value = null;
    }
};

const cancelRoleChange = () => {
    showRoleModal.value = false;
    pendingRoleChange.value = null;
    previousRole.value = null;
};

const onChangeStatusSingle = async (event) => {
    const newStatus = event.target.value;
    if (newStatus === staffData.value.status) return;
    
    // Store pending change and show modal
    previousStatus.value = staffData.value.status;
    pendingStatusChange.value = newStatus;
    showStatusModal.value = true;
    
    // Reset select to old value (will update on confirm)
    event.target.value = staffData.value.status;
};

const confirmStatusChange = async () => {
    const newStatus = pendingStatusChange.value;
    const prev = previousStatus.value;
    staffData.value.status = newStatus;
    showStatusModal.value = false;
    
    try {
        await api.patch(`/staff/${staffId}/status`, { status: newStatus });
        toast.success(`เปลี่ยนสถานะเป็น ${getStatusLabel(newStatus)} แล้ว`);
        await fetchStaffData();
    } catch (e) {
        console.error('Failed to update status', e);
        staffData.value.status = prev;
        toast.apiError(e, 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
        pendingStatusChange.value = null;
        previousStatus.value = null;
    }
};

const cancelStatusChange = () => {
    showStatusModal.value = false;
    pendingStatusChange.value = null;
    previousStatus.value = null;
};

const getRoleLabel = (role) => {
    const labels = {
        staff: 'พนักงาน',
        manager: 'ผู้จัดการ',
        admin: 'แอดมิน'
    };
    return labels[role] || role;
};

const getStatusLabel = (status) => {
    const labels = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Suspended',
        terminated: 'Terminated',
        unemployed: 'Unemployed'
    };
    return labels[status] || status;
};
</script>
