<template>
    <div class="flex flex-col items-center h-full p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">ประวัติ</h2>

        <input v-model="searchQuery" type="text" placeholder="ค้นหาใบเสนอราคา"
            class="w-full p-3 mb-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder-gray-500" />

        <!-- Scrollable container for quotations -->
        <div class="w-full max-h-[70vh] overflow-y-auto border border-black/20 rounded-lg">
            <NuxtLink v-for="quotation in filteredQuotations" :key="quotation.id" :to="`/history/${quotation.id}`"
                class="w-full flex flex-col items-center gap-3 mt-4 text-black no-underline">
                <div class="w-11/12 bg-white border border-black/20 shadow-md rounded-lg p-4">
                    <div class="flex justify-between">
                        <span class="text-lg font-extrabold">ใบเสนอราคา</span>
                        <span class="text-sm font-light">{{ formatDate(quotation.quotationDate) || 'วันที่ไม่ระบุ'
                            }}</span>
                    </div>
                    <hr class="my-2">
                    <div class="flex flex-col gap-1 ml-2">
                        <span class="text-base font-semibold">{{ quotation.carDetails.modelClass || 'โมเดลไม่ระบุ'
                            }}</span>
                        <span class="text-sm font-medium">{{ quotation.carDetails.modelGName || 'รายละเอียดไม่ระบุ'
                            }}</span>
                        <span class="text-sm font-semibold">{{ quotation.customer?.firstName || 'ลูกค้าไม่ระบุ'
                            }}</span>
                    </div>
                </div>
            </NuxtLink>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const quotations = ref([]);
const searchQuery = ref("");
const router = useRouter();

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
    const id = getStaffId();
    if (!id) {
        console.error("No valid staff ID found");
        return;
    }
    try {
        const response = await axios.get(`http://localhost:3001/staff/${id}`);
        quotations.value = response.data.quotations;
        console.log("Quotations fetched:", quotations.value);
    } catch (error) {
        console.error("Error fetching quotations:", error);
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

const filteredQuotations = computed(() => {
    if (!searchQuery.value) return quotations.value;
    return quotations.value.filter((quotation) =>
        quotation.carDetails.modelClass.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        quotation.customer?.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

onMounted(fetchQuotations);

definePageMeta({
    middleware: 'staff-auth'
});
</script>
