<template>
    <div class="h-full bg-[#ececec] text-black p-5">
        <div class="flex justify-between items-center py-3 mb-3">
            <div class="text-5xl font-bold text-black">Staff</div>
        </div>

        <div class="bg-white flex flex-col p-6 rounded-lg shadow-lg">
            <div class="mb-2">
                <button @click="goBack"
                    class="w-24 h-10 bg-[#980000] hover:bg-red-800 cursor-pointer text-white rounded-md mb-2">
                    กลับ </button>
            </div>

            <div class="bg-[#ECECEC] rounded-lg p-2 flex gap-2 items-center mb-2">
                <div class="bg-white flex justify-center items-center p-5 rounded-lg w-[100px] h-[100px]">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15.71 12.71C16.6904 11.9387 17.406 10.8809 17.7572 9.68394C18.1085 8.48697 18.0779 7.21027 17.6698 6.03147C17.2617 4.85267 16.4963 3.83039 15.4801 3.10686C14.4639 2.38332 13.2474 1.99451 12 1.99451C10.7525 1.99451 9.53611 2.38332 8.51993 3.10686C7.50374 3.83039 6.73834 4.85267 6.33021 6.03147C5.92208 7.21027 5.89151 8.48697 6.24276 9.68394C6.59401 10.8809 7.3096 11.9387 8.29 12.71C6.61007 13.383 5.14428 14.4994 4.04889 15.9399C2.95349 17.3805 2.26956 19.0913 2.07 20.89C2.05555 21.0213 2.06711 21.1542 2.10402 21.2811C2.14093 21.4079 2.20246 21.5263 2.28511 21.6293C2.45202 21.8375 2.69478 21.9708 2.96 22C3.22521 22.0292 3.49116 21.9518 3.69932 21.7849C3.90749 21.618 4.04082 21.3752 4.07 21.11C4.28958 19.1552 5.22168 17.3498 6.68822 16.0388C8.15475 14.7278 10.0529 14.003 12.02 14.003C13.9871 14.003 15.8852 14.7278 17.3518 16.0388C18.8183 17.3498 19.7504 19.1552 19.97 21.11C19.9972 21.3557 20.1144 21.5827 20.2991 21.747C20.4838 21.9114 20.7228 22.0015 20.97 22H21.08C21.3421 21.9698 21.5817 21.8373 21.7466 21.6313C21.9114 21.4252 21.9881 21.1624 21.96 20.9C21.7595 19.0962 21.0719 17.381 19.9708 15.9382C18.8698 14.4954 17.3969 13.3795 15.71 12.71ZM12 12C11.2089 12 10.4355 11.7654 9.77772 11.3259C9.11992 10.8864 8.60723 10.2616 8.30448 9.53074C8.00173 8.79983 7.92251 7.99557 8.07686 7.21964C8.2312 6.44372 8.61216 5.73099 9.17157 5.17158C9.73098 4.61217 10.4437 4.2312 11.2196 4.07686C11.9956 3.92252 12.7998 4.00173 13.5307 4.30448C14.2616 4.60724 14.8863 5.11993 15.3259 5.77772C15.7654 6.43552 16 7.20888 16 8C16 9.06087 15.5786 10.0783 14.8284 10.8284C14.0783 11.5786 13.0609 12 12 12Z"
                            fill="#1E1E1E" />
                    </svg>
                </div>

                <div class="ml-4 bg-[#ECECEC] p-2 rounded-lg flex flex-col flex-1">
                    <div v-if="loading" class="text-gray-500">Loading staff details...</div>
                    <div v-else-if="staffData">
                        <div class="row-1 flex gap-3 my-1 text-xl font-bold">
                            {{ staffData.firstName }} {{ staffData.lastName }}
                        </div>
                        <div class="row-2 flex flex-wrap gap-3 my-1 text-lg">
                            <p><strong class="text-semibold text-xl">ตำแหน่ง :</strong> {{ staffData.role }}</p>
                            <p><strong class="text-semibold text-xl">จังหวัด : </strong> {{ staffData.city }}</p>
                            <p><strong class="text-semibold text-xl">สาขา : </strong> {{ staffData.branch }}</p>
                        </div>
                        <div class="row-3 flex flex-wrap gap-3 my-1 text-lg">
                            <p><strong class="text-semibold text-xl">อีเมลล์ :</strong> {{ staffData.email }}</p>
                            <p><strong class="text-semibold text-xl">เบอร์โทรศัพท์ :</strong> {{ staffData.phoneNumber
                            }}</p>
                            <p><strong class="text-semibold text-xl">เพศ :</strong> {{ staffData.gender }}</p>
                        </div>
                    </div>
                    <div v-else>
                        <p>No staff found.</p>
                    </div>
                </div>
            </div>

            <div class="flex items-center mb-2">
                <div class="relative w-100">
                    <input type="text" v-model="searchQuery" @input="debouncedSearch" placeholder="ค้นหา"
                        class="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white h-10 !pl-3" />
                </div>
            </div>

            <div class="overflow-x-auto">
                <table v-if="staffData && staffData.quotations.length"
                    class="w-full border-collapse min-w-[700px] border-spacing-0 table-fixed ">
                    <thead class="bg-[#f1f5f9] text-white font-bold text-[0.9rem] border-b-2 border-gray-300 text-left">
                        <tr>
                            <th
                                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-gray-700 font-semibold text-[0.9rem] border-b-2 border-gray-300">
                                ไอดี</th>
                            <th
                                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-gray-700 font-semibold text-[0.9rem] border-b-2 border-gray-300">
                                ชื่อลูกค้า</th>
                            <th
                                class="p-[10px] px-[15px] text-left bg-[#f1f5f9] text-gray-700 font-semibold text-[0.9rem] border-b-2 border-gray-300">
                                ใบเสนอราคา</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(quotation, index) in paginatedQuotations" :key="index"
                            @click="goToHistory(quotation.id)"
                            class="odd:bg-white even:bg-gray-50 transition-colors duration-200 hover:bg-gray-100 cursor-pointer">
                            <td class="p-[10px] px-[15px] text-gray-700 border-b border-gray-200 ml-2"
                                :title="String(quotation.id)">
                                {{ quotation.id }}
                            </td>
                            <td class="p-[10px] px-[15px] text-gray-700 border-b border-gray-200"
                                :title="quotation.customer?.firstName">
                                {{ quotation.customer.firstName }}
                            </td>
                            <td class="p-[10px] px-[15px] text-gray-700 border-b border-gray-200"
                                :title="quotation.carDetails?.modelClass">
                                {{ quotation.carDetails.modelClass }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p v-else>ไม่มีข้อมูลใบเสนอราคา</p>
            </div>


        </div>
        <div class="flex justify-center items-center gap-4 mt-6" style="margin-top: 10px;">
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
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import axios from "axios";
import _ from 'lodash';

const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const route = useRoute();
const router = useRouter();
const staffId = route.params.id;

const staffData = ref(null);
const loading = ref(true);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(6); 

const debouncedSearch = _.debounce(() => {
    currentPage.value = 1; 
}, 400);

const fetchStaffData = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`${backendUrl}/staff/${staffId}`);
        staffData.value = response.data;
    } catch (error) {
        console.error("Error fetching staff data:", error);
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
            qu.carDetails?.modelClass?.toLowerCase().includes(q)
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
</script>
