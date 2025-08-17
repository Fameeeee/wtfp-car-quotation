<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">ประวัติ</h2>

        <div class="relative w-full">
            <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหาใบเสนอราคา"
                class="w-full p-3 mb-4 border rounded-lg shadow-sm text-black" />
        </div>

        <NuxtLink v-for="quotation in quotations" :key="quotation.id" :to="`/history/${quotation.id}`"
            class="w-full flex flex-col items-center gap-3 mt-4 text-black no-underline">
            <div class="w-11/12 bg-white border border-black/20 shadow-md rounded-lg p-4">
                <div class="flex justify-between">
                    <span class="text-lg font-extrabold">ใบเสนอราคา</span>
                    <span class="text-sm font-light">{{ formatDate(quotation.quotationDate) || 'วันที่ไม่ระบุ' }}</span>
                </div>
                <hr class="my-2" />
                <div class="flex flex-col gap-1 ml-2">
                    <span class="text-base font-semibold">{{ quotation.carDetails.modelClass || 'โมเดลไม่ระบุ' }}</span>
                    <span class="text-sm font-medium">{{ quotation.carDetails.modelGName || 'รายละเอียดไม่ระบุ'
                        }}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold">{{ quotation.customer?.firstName || 'ลูกค้าไม่ระบุ'
                            }}</span>
                        <span class="text-sm font-semibold">{{ quotation.customer?.lastName || 'ลูกค้าไม่ระบุ' }}</span>
                    </div>
                </div>
            </div>
        </NuxtLink>

        <div class="flex justify-center gap-2 mt-4">
            <button v-if="visiblePages[0] > 1" @click="() => { currentPage = visiblePages[0] - 1; fetchQuotations(); }"
                class="px-4 py-2 rounded-md border border-gray-400 bg-white text-black">
                &laquo;
            </button>

            <button v-for="page in visiblePages" :key="page" @click="() => { currentPage = page; fetchQuotations(); }"
                class="px-4 py-2 rounded-md border border-gray-400"
                :class="{ 'bg-red-500 text-white': currentPage === page, 'bg-white text-black': currentPage !== page }">
                {{ page }}
            </button>

            <button v-if="visiblePages[visiblePages.length - 1] < totalPages"
                @click="() => { currentPage = visiblePages[visiblePages.length - 1] + 1; fetchQuotations(); }"
                class="px-4 py-2 rounded-md border border-gray-400 bg-white text-black">
                &raquo;
            </button>
        </div>


    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import _ from 'lodash';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const currentPage = ref(1);
const itemsPerPage = 4;
const totalPages = ref(0);
const total = ref(0);
const loading = ref(false);
const searchQuery = ref("");
const quotations = ref([]);

const getStaffId = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    try {
        const decodedToken = atob(token.split(".")[1]);
        const parsedToken = JSON.parse(decodedToken);
        return parsedToken.id;
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
};

const fetchQuotations = async () => {
    const staffId = getStaffId();
    if (!staffId) {
        console.error("Staff ID is not available");
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(`${backendUrl}/quotation/staff/${staffId}`, {
            params: {
                page: currentPage.value,
                limit: itemsPerPage,
                search: searchQuery.value,
            },
        });
        quotations.value = response.data.data || [];
        totalPages.value = response.data.totalPages || 0;
        total.value = response.data.total || 0;
    } catch (error) {
        console.error("Error fetching quotations:", error);
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

const debouncedSearch = _.debounce(() => {
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

onMounted(fetchQuotations);

definePageMeta({
    middleware: 'staff-auth'
});
</script>
