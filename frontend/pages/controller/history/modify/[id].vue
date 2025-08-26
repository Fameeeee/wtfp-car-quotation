<template>
    <div class="h-full bg-[#ececec] text-black p-5">
        <div class="flex justify-between items-center py-3 mb-3">
            <div class="text-5xl font-bold text-black">History</div>
        </div>

        <div class="bg-white flex flex-col p-6 rounded-lg shadow-lg">
            <div class="flex item-center justify-between mb-6">
                <button @click="goBack"
                    class="w-24 h-10 bg-[#980000] hover:bg-red-800 cursor-pointer text-white rounded-md mb-2">
                    กลับ
                </button>
                <div class="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-black">แก้ไขใบเสนอราคา
                </div>
            </div>
            <div class="flex flex-col items-center justify-center w-full h-full p-8 gap-5">
                <carDetailsDropdown label="รุ่นรถ" :quotation-id="quotationId"
                    @update="data => handleUpdate('carDetails', data)" />
                <paymentDropdown label="รูปแบบการชำระเงิน" :quotation-id="quotationId"
                    @update="data => handleUpdate('payment', data)" />
                <accessoriesDropdown label="อุปกรณ์ตกแต่ง" :quotation-id="quotationId"
                    @update="data => handleUpdate('accessories', data)" />
                <additionDropdown label="ค่าใช้จ่ายเพิ่มเติม" :quotation-id="quotationId"
                    @update="data => handleUpdate('additionCosts', data)" />
                <customerDropdown label="ข้อมูลลูกค้า" :quotation-id="quotationId"
                    @update="data => handleUpdate('customer', data)" />
            </div>
            <div class="flex justify-center w-full mt-6 ">
                <button @click="goNext"
                    class="py-3 px-4 text-white bg-[#980000] rounded-lg hover:bg-red-800 w-full max-w-md cursor-pointer">
                    ยืนยัน
                </button>
            </div>
        </div>
        <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?"
            confirmText="ยืนยัน" cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />

        <modalSave v-if="showSaveModal" message="Do you want to save this?" @confirm="handleSaveConfirm"
            @cancel="closeSaveModal" />
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';
import { jwtDecode } from 'jwt-decode';

import carDetailsDropdown from '~/components/user/carDetailsDropdown.vue';
import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';
import modalSave from '~/components/user/modalSave.vue';
import modalDiscard from '~/components/user/modalDiscard.vue';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;
const route = useRoute()
const router = useRouter()
const quotationId = route.params.id

const showSaveModal = ref(false);
const showModal = ref(false);
const quotationData = ref({});

const allData = reactive({
    customer: {
        firstName: "",
        lastName: "",
        phoneNumber: "",
    },
    paymentMethod: "",
    installmentPlans: [],
    additionCosts: {
        cmi: false,
        insurance: false,
        fuelValue: 0,
        note: "",
    },
    carDetails: {
        unitType: "",
        modelClass: "",
        modelCodeName: "",
        modelGName: "",
        price: 0,
        color: "",
    },
    accessories: [],
    staffId: null,
});

console.log(quotationId)

onMounted(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            allData.staffId = decoded.staffId || decoded.id;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }
})

axios
    .get(`${backendUrl}/quotation/${quotationId}`)
    .then((response) => {
        quotationData.value = response.data;
    })
    .catch((error) => {
        console.error("Error fetching quotation data:", error);
    });

const goBack = () => {
    showModal.value = true;
};

const goNext = () => {
    quotationData.value = { ...allData };
    showSaveModal.value = true;
};

const handleSaveConfirm = async (saveAsNew) => {
    showSaveModal.value = false;

    try {
        if (saveAsNew) {
            await axios.post(`${backendUrl}/quotation/create`, allData);
        } else {
            await axios.put(`${backendUrl}/quotation/${quotationId}`, allData);
        }
        alert("บันทึกข้อมูลเรียบร้อยแล้ว");
        router.push(`/controller/history/${quotationId}`);
    } catch (error) {
        console.error("Error saving quotation:", error);
    }
};

const closeSaveModal = () => (showSaveModal.value = false);
const closeModal = () => (showModal.value = false);
const discardChanges = () => {
    showModal.value = false;
    router.push(`/controller/history/${quotationId}`);
};

const handleUpdate = (key, data) => {
    if (key === "payment") {
        allData.paymentMethod = data.paymentMethod;
        if (data.installmentPlans) allData.installmentPlans = data.installmentPlans;
    } else {
        allData[key] = data;
    }
};



definePageMeta({
    middleware: 'admin-auth',
    layout: 'admin',
})
</script>