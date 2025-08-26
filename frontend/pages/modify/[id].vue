<template>
    <div class="flex text-black flex-col items-center justify-center w-full h-full p-8 gap-5">
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

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goBack" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                กลับ
            </button>
            <button @click="goNext" class="py-3 px-4 text-white bg-[#980000] rounded-lg hover:bg-red-800">
                ยืนยัน
            </button>
        </div>
    </div>
    <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />

    <modalSave v-if="showSaveModal" message="Do you want to save this?" @confirm="handleSaveConfirm"
        @cancel="closeSaveModal" />

</template>

<script setup>``
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import buttonGroup from '~/components/user/buttonGroup.vue';
import carDetailsDropdown from '~/components/user/carDetailsDropdown.vue';
import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';
import modalSave from '~/components/user/modalSave.vue';
import { jwtDecode } from 'jwt-decode';

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const paymentPlan = ref('');
const cashPlan = ref({});
const installmentPlans = ref([]);
const showModal = ref(false);
const showSaveModal = ref(false);

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;


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


onMounted(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            allData.staffId = decoded.staffId || decoded.id;
        } catch (err) {
            console.error("Failed to decode token", err);
        }
    }
});

axios
    .get(`${backendUrl}/quotation/${quotationId}`)
    .then((response) => {
        quotationData.value = response.data;
        if (response.data.cashPlans) {
            cashPlan.value = response.data.cashPlans;
            paymentPlan.value = 'เงินสด';
        } else if (response.data.installmentPlans) {
            installmentPlans.value = response.data.installmentPlans;
            paymentPlan.value = 'ผ่อนชำระ';
        } else {
            console.error('No payment plan found in the response data.');
        }
    })
    .catch((error) => {
        console.error('Error fetching quotation data:', error);
    });

const goBack = () => {
    showModal.value = true;
};

const goNext = () => {
    quotationData.value = {
        ...allData,
    };

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

        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        router.push('/history');
    } catch (error) {
        console.error("Error saving quotation:", error);
    }
};


const closeSaveModal = () => {
    showSaveModal.value = false;
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    router.push('/history');
};

const handleUpdate = (key, data) => {
    if (key === "payment") {
        allData.paymentMethod = data.paymentMethod;
        if (data.installmentPlans) allData.installmentPlans = data.installmentPlans;
    } else {
        allData[key] = data;
    }
};





</script>