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
                    <h1 class="text-2xl font-bold">แก้ไขใบเสนอราคา</h1>
                </div>
                <div class="text-sm text-gray-600">
                    รหัส: {{ quotationId }}
                </div>
            </div>
        </header>

        <main class="max-w-4xl mx-auto px-4 py-6">
            <!-- Form sections -->
            <div class="space-y-6">
                <!-- Car Details (Read-only display) -->
                <div class="bg-white rounded-lg border shadow-sm p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">รุ่นรถ (ข้อมูลปัจจุบัน)</h2>
                    <div v-if="quotationData.carDetails" class="grid grid-cols-2 gap-4 text-sm">
                        <div><span class="font-medium text-gray-600">รุ่น:</span> {{ quotationData.carDetails.modelClass
                            || '-' }}</div>
                        <div><span class="font-medium text-gray-600">ชื่อรุ่น:</span> {{
                            quotationData.carDetails.modelGName || '-' }}</div>
                        <div><span class="font-medium text-gray-600">รหัสรุ่น:</span> {{
                            quotationData.carDetails.modelCodeName || '-' }}</div>
                        <div><span class="font-medium text-gray-600">สี:</span> {{ quotationData.carDetails.color || '-'
                        }}</div>
                        <div><span class="font-medium text-gray-600">ราคา:</span> {{
                            quotationData.carDetails.price?.toLocaleString?.('th-TH') || '-' }} บาท</div>
                    </div>
                    <div class="mt-2 text-xs text-amber-600">ไม่สามารถแก้ไขรายละเอียดรถในหน้าปรับแก้ได้</div>
                </div>

                <!-- Payment Method -->
                <paymentDropdown label="รูปแบบการชำระเงิน" :quotation-id="quotationId"
                    @update="data => handleUpdate('payment', data)" class="mb-4 bg-white" />

                <!-- Accessories -->
                <accessoriesDropdown label="อุปกรณ์ตกแต่ง" :quotation-id="quotationId"
                    @update="data => handleUpdate('accessories', data)" class="mb-4 bg-white" />

                <!-- Additional Costs -->
                <additionDropdown label="ค่าใช้จ่ายเพิ่มเติม" :quotation-id="quotationId"
                    @update="data => handleUpdate('additionCosts', data)" class="mb-4 bg-white" />

                <!-- Customer Info -->
                <customerDropdown label="ข้อมูลลูกค้า" :quotation-id="quotationId"
                    @update="data => handleUpdate('customer', data)" class="mb-4 bg-white" />
            </div>

            <!-- Action buttons -->
            <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button @click="goNext"
                    class="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    บันทึกการเปลี่ยนแปลง
                </button>
                <button @click="goBack"
                    class="px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                    ยกเลิก
                </button>
            </div>
            
            <!-- Save confirmation modal (save as new only) -->
            <div v-if="showSaveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40" @click="closeSaveModal"></div>
                <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <h3 class="text-lg font-semibold mb-2">ยืนยันการบันทึก</h3>
                    <p class="text-sm text-gray-600 mb-4">การบันทึกจะสร้างใบเสนอราคาใหม่ (ไม่แก้ไขใบเสนอราคาเดิม)</p>
                    <div class="flex gap-3 justify-end">
                        <button @click="closeSaveModal" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">ยกเลิก</button>
                        <button @click="handleSaveConfirm(true)" class="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">บันทึกเป็นใหม่</button>
                    </div>
                </div>
            </div>

            <!-- Discard confirmation modal -->
            <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
                <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <h3 class="text-lg font-semibold mb-2">ยืนยันการยกเลิก</h3>
                    <p class="text-sm text-gray-600 mb-4">ท่านแน่ใจหรือไม่ว่าต้องการยกเลิกและทิ้งการเปลี่ยนแปลง?</p>
                    <div class="flex gap-3 justify-end">
                        <button @click="closeModal" class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">ยกเลิก</button>
                        <button @click="discardChanges" class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">ทิ้งการเปลี่ยนแปลง</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import { getStaffIdAsync } from '~/composables/useAuth'

import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';

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
    cashPlans: null,
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

onMounted(async () => {
    const sid = await getStaffIdAsync();
    if (sid) allData.staffId = sid;
})

axios
    .get(`${backendUrl}/quotation/${quotationId}`)
    .then((response) => {
        const data = response.data || {};
        quotationData.value = data;

        // Initialize allData from existing quotation so save/create includes current values
        if (data.customer) {
            allData.customer = {
                firstName: data.customer.firstName || allData.customer.firstName,
                lastName: data.customer.lastName || allData.customer.lastName,
                phoneNumber: data.customer.phoneNumber || allData.customer.phoneNumber,
            };
        }

        if (data.paymentMethod) {
            allData.paymentMethod = data.paymentMethod;
        }

        if (Array.isArray(data.installmentPlans)) {
            allData.installmentPlans = data.installmentPlans;
        }

        if (data.cashPlans) {
            allData.cashPlans = data.cashPlans;
        }

        if (data.additionCosts) {
            allData.additionCosts = data.additionCosts;
        }

        if (data.carDetails) {
            allData.carDetails = data.carDetails;
        }

        if (Array.isArray(data.accessories)) {
            allData.accessories = data.accessories;
        }

        // staffId may be nested under staff
        allData.staffId = (data.staff && data.staff.id) || data.staffId || allData.staffId;
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

    // Build payload explicitly so create/put receive the same shape
    const payload = {
        customer: allData.customer,
        paymentMethod: allData.paymentMethod,
        installmentPlans: allData.installmentPlans || [],
        cashPlans: allData.cashPlans || null,
        additionCosts: allData.additionCosts,
        carDetails: allData.carDetails,
        accessories: allData.accessories || null,
        staffId: allData.staffId,
    };

    // normalize payment fields: keep only relevant plan
    if (payload.paymentMethod === 'cash') {
        payload.installmentPlans = [];
    }

    try {
        console.log('Submitting quotation save', { saveAsNew, payload, quotationId });
        if (saveAsNew) {
            const res = await axios.post(`${backendUrl}/quotation/create`, payload);
            // try multiple possible response shapes for the new id
            const d = res?.data || {};
            const newId = d.quotationId || d.id || (d.data && d.data.quotationId) || (d.quotation && d.quotation.id) || null;
            console.log('create response data:', d, 'resolved newId=', newId);
            alert("บันทึกข้อมูลเรียบร้อยแล้ว");
            if (newId) {
                // navigate to the controller history detail of the new quotation
                await router.push(`/controller/history/${newId}`);
            } else {
                await router.push(`/controller/history`);
            }
        } else {
            // ensure path id is numeric and send payload
            await axios.put(`${backendUrl}/quotation/${Number(quotationId)}`, payload);
            alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
            router.push(`/controller/history/${quotationId}`);
        }
    } catch (error) {
        console.error("Error saving quotation:", error);
        const msg = error?.response?.data?.error || error?.response?.data || error?.message || 'Unknown error';
        // show server-provided message when available
        alert(`พบข้อผิดพลาด: ${JSON.stringify(msg)}`);
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