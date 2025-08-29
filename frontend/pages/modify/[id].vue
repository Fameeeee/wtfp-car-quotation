<template>
    <div class="flex text-black flex-col items-center w-full min-h-screen p-4 gap-5">
        <!-- Read-only car details -->
        <div class="w-full max-w-2xl bg-white border rounded-lg shadow-sm p-4">
            <div class="text-lg font-bold mb-2">รุ่นรถ</div>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <div class="text-gray-500">รุ่นปีรถ</div>
                    <div class="font-semibold">{{ allData.carDetails.modelClass || '-' }}</div>
                </div>
                <div>
                    <div class="text-gray-500">รุ่นรถ</div>
                    <div class="font-semibold">{{ allData.carDetails.modelGName || '-' }}</div>
                </div>
                <div>
                    <div class="text-gray-500">รหัสรุ่น</div>
                    <div class="font-semibold">{{ allData.carDetails.modelCodeName || '-' }}</div>
                </div>
                <div>
                    <div class="text-gray-500">สีตัวถัง</div>
                    <div class="font-semibold">{{ allData.carDetails.color || '-' }}</div>
                </div>
                <div>
                    <div class="text-gray-500">ราคารถ</div>
                    <div class="font-semibold">{{ allData.carDetails.price?.toLocaleString?.('th-TH') || '-' }} บาท</div>
                </div>
            </div>
            <div class="mt-2 text-xs text-amber-600">ไม่สามารถแก้ไขรายละเอียดรถในหน้าปรับแก้ได้</div>
        </div>

        <!-- Payment method selector -->
        <paymentDropdown label="รูปแบบการชำระเงิน" :quotation-id="quotationId"
            @update="data => handleUpdate('payment', data)" />


        <!-- Accessories editable -->
        <accessoriesDropdown label="อุปกรณ์ตกแต่ง" :quotation-id="quotationId"
            @update="data => handleUpdate('accessories', data)" />

        <!-- Addition costs like add-cost -->
        <additionDropdown label="ค่าใช้จ่ายเพิ่มเติม" :quotation-id="quotationId"
            @update="data => handleUpdate('additionCosts', data)" />

        <!-- Customer info with duplicate check on save -->
        <customerDropdown label="ข้อมูลลูกค้า" :quotation-id="quotationId"
            @update="data => handleUpdate('customer', data)" />

        <div class="flex flex-col space-y-4 w-full max-w-md my-4">
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

    <modalSave v-if="showSaveModal" message="Do you want to save this?" :show-save-as-new="false" @confirm="handleSaveConfirm"
        @cancel="closeSaveModal" />

</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';
import modalSave from '~/components/user/modalSave.vue';
import { getStaffIdAsync } from '~/composables/useAuth'
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';
import { useQuotationStore } from '~/stores/quotation';

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
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


onMounted(async () => {
    try {
        const staffId = await getStaffIdAsync();
        if (staffId) allData.staffId = staffId;
    } catch (err) {
        console.error('Failed to read staff id from token', err);
    }
});

const store = useQuotationStore();

axios
    .get(`${backendUrl}/quotation/${quotationId}`)
    .then((response) => {
        quotationData.value = response.data;
        // hydrate local allData from existing quotation
        allData.customer = response.data.customer || allData.customer;
        allData.paymentMethod = response.data.paymentMethod || '';
        allData.installmentPlans = response.data.installmentPlans || [];
        allData.additionCosts = response.data.additionCosts || allData.additionCosts;
        allData.carDetails = response.data.carDetails || allData.carDetails;
        allData.accessories = response.data.accessories || [];
        // hydrate store for payment detail components
    try {
            store.selectedCar = allData.carDetails;
            if (response.data.cashPlans) {
                if (typeof store.setCashPlan === 'function') store.setCashPlan(response.data.cashPlans);
                else store.cashPlan = response.data.cashPlans;
            }
            if (response.data.installmentPlans) {
                if (typeof store.setInstallmentPlans === 'function') store.setInstallmentPlans(response.data.installmentPlans);
                else store.installmentPlans = response.data.installmentPlans;
            }
        } catch {}
    })
    .catch((error) => {
        console.error('Error fetching quotation data:', error);
    });

const goBack = () => {
    showModal.value = true;
};

const goNext = () => {
    // open confirm modal before saving
    showSaveModal.value = true;
};


const handleSaveConfirm = async () => {
    showSaveModal.value = false;

    try {
        // Check duplicate customer
        const conflict = await checkCustomerDuplicate(allData.customer);
        if (conflict) {
            const proceed = window.confirm('พบเบอร์โทรซ้ำ แต่ชื่อ-สกุลไม่ตรงกับข้อมูลเดิมในระบบ ต้องการบันทึกต่อหรือไม่?');
            if (!proceed) return;
        }

        // Build payload with current payment details from store
        const payload = { ...allData };
        if (allData.paymentMethod === 'cash') {
            payload.cashPlans = store.cashPlan || {};
            payload.installmentPlans = [];
        } else if (allData.paymentMethod === 'installment') {
            payload.installmentPlans = store.installmentPlans || [];
            delete payload.cashPlans;
        }

        // Always create a new quotation
        await axios.post(`${backendUrl}/quotation/create`, payload);

        alert('บันทึกข้อมูลเรียบร้อยแล้ว');
        router.push(`/history`);
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
    router.push(`/history/${quotationId}`);
};

const handleUpdate = (key, data) => {
    if (key === "payment") {
        allData.paymentMethod = data.paymentMethod;
        if (data.installmentPlans) allData.installmentPlans = data.installmentPlans;
    } else if (key === 'carDetails') {
        // ignore carDetails updates in modify page (read-only)
        return;
    } else {
        allData[key] = data;
    }
};
// Check duplicate customer: same phone but different first/last name
const checkCustomerDuplicate = async (cust) => {
    try {
        const phone = (cust?.phoneNumber || '').trim();
        if (!phone) return false;
        let resp = null;
        // Try common endpoints progressively
        try { resp = await axios.get(`${backendUrl}/customer/phone/${encodeURIComponent(phone)}`); } catch {}
        if (!resp || !resp.data) {
            try { resp = await axios.get(`${backendUrl}/customer`, { params: { phoneNumber: phone } }); } catch {}
        }
        if (!resp || !resp.data) {
            try { resp = await axios.get(`${backendUrl}/customer/search`, { params: { phone: phone } }); } catch {}
        }
        const records = Array.isArray(resp?.data) ? resp.data : (resp?.data ? [resp.data] : []);
        if (records.length === 0) return false;
        const mismatch = records.some(r =>
            (r.phoneNumber === phone) &&
            ((r.firstName && r.firstName !== cust.firstName) || (r.lastName && r.lastName !== cust.lastName))
        );
        return mismatch;
    } catch (e) {
        console.warn('Customer duplicate check skipped:', e);
        return false;
    }
};




</script>