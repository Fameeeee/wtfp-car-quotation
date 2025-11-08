<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">ประวัติ</h2>

        <div class="relative w-full max-w-xl mx-auto">
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหาใบเสนอราคา"
                class="w-full p-3 mb-4 border rounded-lg shadow-sm text-black" />
        </div>

        <template v-if="clientReady">
            <NuxtLink v-for="quotation in quotations" :key="quotation.quotationId"
                :to="`/history/${quotation.quotationId}`"
                class="w-full max-w-xl mx-auto flex flex-col items-center gap-3 mt-4 text-black no-underline">
                <div class="w-full bg-white border border-black/20 shadow-md rounded-lg p-4">
                    <div class="flex justify-between">
                        <span class="text-lg font-extrabold">ใบเสนอราคา</span>
                        <span class="text-sm font-light">{{ formatDate(quotation.quotationDate) || 'วันที่ไม่ระบุ'
                            }}</span>
                    </div>
                    <hr class="my-2" />
                    <div class="flex flex-col gap-1 ml-2">
                        <span class="text-base font-semibold">{{ quotation.carDetails.modelClass || 'โมเดลไม่ระบุ'
                            }}</span>
                        <span class="text-sm font-medium">{{ quotation.carDetails.modelGName || 'รายละเอียดไม่ระบุ'
                            }}</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold">{{ quotation.customer?.firstName || 'ลูกค้าไม่ระบุ'
                                }}</span>
                            <span class="text-sm font-semibold">{{ quotation.customer?.lastName || 'ลูกค้าไม่ระบุ'
                                }}</span>
                        </div>
                    </div>
                </div>
            </NuxtLink>
        </template>

        <div v-if="!loading && quotations.length === 0" class="w-full max-w-2xl text-center text-gray-500 mt-6">
            ไม่พบรายการ
        </div>

        <div class="flex justify-center gap-2 mt-4">
            <button v-if="visiblePages[0] > 1" @click="goPrevGroup"
                class="px-4 py-2 rounded-md border border-gray-400 bg-white text-black" :disabled="loading">
                &laquo;
            </button>

            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                class="px-4 py-2 rounded-md border border-gray-400" :disabled="loading"
                :class="{ 'bg-[#980000] text-white': currentPage === page, 'bg-white text-black': currentPage !== page }">
                {{ page }}
            </button>

            <button v-if="visiblePages[visiblePages.length - 1] < totalPages" @click="goNextGroup"
                class="px-4 py-2 rounded-md border border-gray-400 bg-white text-black" :disabled="loading">
                &raquo;
            </button>
        </div>


    </div>
</template>


<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { useApi } from '~/composables/useApi';
import debounce from 'lodash/debounce';
import { getStaffIdAsync } from '~/composables/useAuth.ts'


const config = useRuntimeConfig()
const api = useApi();


const currentPage = ref(1);
const itemsPerPage = ref(5);
const totalPages = ref(0);
const total = ref(0);
const loading = ref(false);
let abortController = null;
const searchQuery = ref("");
const quotations = ref([]);
const clientReady = ref(false);

const adjustItemsPerPage = () => {
    if (typeof window === 'undefined') return;
    const viewportHeight = window.innerHeight;
    itemsPerPage.value = Math.max(3, Math.floor((viewportHeight - 320) / 100));
}


const fetchQuotations = async () => {
    const staffId = await getStaffIdAsync();
    if (!staffId) {
        console.error("Staff ID is not available");
        return;
    }

    loading.value = true;
    try {
        if (abortController) {
            abortController.abort();
        }
        abortController = new AbortController();
        const response = await api.get(`/quotation/staff/${staffId}`, {
            params: {
                page: currentPage.value,
                limit: itemsPerPage.value,
                search: searchQuery.value,
            },
            signal: abortController.signal,
        });
        const responseData = response.data.data.data;
        const quotationsList = Array.isArray(responseData) ? responseData : (responseData?.quotations || []);

        quotations.value = quotationsList.map(q => ({
            quotationId: q.quotationId,
            quotationDate: q.quotationDate,
            carDetails: {
                modelClass: q.carDetails?.modelClass,
                modelGName: q.carDetails?.modelGName,
            },
            customer: q.customer
                ? { customerId: q.customer.customerId, firstName: q.customer.firstName, lastName: q.customer.lastName }
                : null,
            staff: q.staff
                ? { staffId: q.staff.staffId, firstName: q.staff.firstName, lastName: q.staff.lastName }
                : null,
        }));
        totalPages.value = response.data.pagination?.totalPages || 0;
        total.value = response.data.pagination?.total || 0;
    } catch (error) {
        if (axios.isCancel?.(error)) {
        } else if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        } else {
            console.error("Error fetching quotations:", error);
        }
    } finally {
        loading.value = false;
    }
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const debouncedSearch = debounce(() => {
    currentPage.value = 1;
    fetchQuotations();
}, 500);

const visiblePages = computed(() => {
    const totalVisible = 3;
    const start = Math.floor((currentPage.value - 1) / totalVisible) * totalVisible + 1;
    const end = Math.min(start + totalVisible - 1, totalPages.value);

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }
    return pages;
});


onMounted(() => {
    adjustItemsPerPage();
    window.addEventListener('resize', adjustItemsPerPage);
    fetchQuotations();
    clientReady.value = true;
});

onBeforeUnmount(() => {
    if (abortController) {
        abortController.abort();
    }
    window.removeEventListener('resize', adjustItemsPerPage);
});

const goToPage = (page) => {
    if (page === currentPage.value || page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    fetchQuotations();
};

const goPrevGroup = () => {
    const prev = visiblePages.value[0] - 1;
    if (prev >= 1) {
        goToPage(prev);
    }
};

const goNextGroup = () => {
    const next = visiblePages.value[visiblePages.value.length - 1] + 1;
    if (next <= totalPages.value) {
        goToPage(next);
    }
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>
