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
        <div class="w-full max-w-2xl">
            <paymentDropdown label="รูปแบบการชำระเงิน" :quotation-id="quotationId"
                @update="data => handleUpdate('payment', data)" />
        </div>

        <!-- Accessories editable -->
        <div class="w-full max-w-2xl">
            <accessoriesDropdown label="อุปกรณ์ตกแต่ง" :quotation-id="quotationId"
                @update="data => handleUpdate('accessories', data)" />
        </div>

        <!-- Addition costs like add-cost -->
        <div class="w-full max-w-2xl">
            <additionDropdown label="ค่าใช้จ่ายเพิ่มเติม" :quotation-id="quotationId"
                @update="data => handleUpdate('additionCosts', data)" />
        </div>

        <!-- Customer info with duplicate check on save -->
        <div class="w-full max-w-2xl">
            <customerDropdown label="ข้อมูลลูกค้า" :quotation-id="quotationId"
                @update="data => handleUpdate('customer', data)" />
        </div>

        <!-- Template Selector -->
        <div class="w-full max-w-2xl">
            <div class="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-3">เลือกรูปแบบใบเสนอราคา</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <!-- Standard Template -->
                    <button 
                        @click="selectTemplate('standard')"
                        :class="[
                            'relative border-2 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md',
                            selectedTemplate === 'standard' 
                                ? 'border-[#980000] bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        ]"
                    >
                        <div class="flex items-start gap-2 sm:gap-3">
                            <div class="flex-shrink-0 mt-1">
                                <div :class="[
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    selectedTemplate === 'standard' 
                                        ? 'border-[#980000] bg-[#980000]' 
                                        : 'border-gray-300'
                                ]">
                                    <svg v-if="selectedTemplate === 'standard'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="font-semibold text-gray-800 text-sm sm:text-base">Standard</div>
                            </div>
                        </div>
                    </button>

                    <!-- Template 1 -->
                    <button 
                        @click="selectTemplate('template1')"
                        :class="[
                            'relative border-2 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md',
                            selectedTemplate === 'template1' 
                                ? 'border-[#980000] bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        ]"
                    >
                        <div class="flex items-start gap-2 sm:gap-3">
                            <div class="flex-shrink-0 mt-1">
                                <div :class="[
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    selectedTemplate === 'template1' 
                                        ? 'border-[#980000] bg-[#980000]' 
                                        : 'border-gray-300'
                                ]">
                                    <svg v-if="selectedTemplate === 'template1'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="font-semibold text-gray-800 text-sm sm:text-base">Template 1</div>
                            </div>
                        </div>
                    </button>

                    <!-- Template 2 -->
                    <button 
                        @click="selectTemplate('template2')"
                        :class="[
                            'relative border-2 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md',
                            selectedTemplate === 'template2' 
                                ? 'border-[#980000] bg-red-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        ]"
                    >
                        <div class="flex items-start gap-2 sm:gap-3">
                            <div class="flex-shrink-0 mt-1">
                                <div :class="[
                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                    selectedTemplate === 'template2' 
                                        ? 'border-[#980000] bg-[#980000]' 
                                        : 'border-gray-300'
                                ]">
                                    <svg v-if="selectedTemplate === 'template2'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="font-semibold text-gray-800 text-sm sm:text-base">Template 2</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-2xl my-4">
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

    <!-- Custom save confirmation modal -->
    <div v-if="showSaveModal" class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
            <p class="text-lg text-[#696969] mb-2 font-semibold">ยืนยันการบันทึก</p>
            <p class="text-sm text-gray-600 mb-6">การบันทึกจะสร้างใบเสนอราคาใหม่<br/>(ไม่แก้ไขใบเสนอราคาเดิม)</p>

            <div class="flex gap-4 justify-center">
                <button @click="handleSaveConfirm"
                    class="py-3 px-6 text-lg font-semibold text-white bg-[#980000] rounded-lg hover:bg-red-800 transform transition-transform duration-200 hover:scale-105">
                    บันทึกเป็นใหม่
                </button>
                <button @click="closeSaveModal"
                    class="py-3 px-6 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { ref, reactive, onMounted } from 'vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';
import { getStaffIdAsync } from '~/composables/useAuth.ts'
import { useQuotationStore } from '~/stores/quotation';

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const showModal = ref(false);
const showSaveModal = ref(false);
const selectedTemplate = ref('standard'); // Default to standard template

const config = useRuntimeConfig()
const api = useApi();


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

api
    .get(`/quotation/${quotationId}`)
    .then((response) => {
        // New response structure: { statusCode, message, data: {...} }
        const data = response.data.data || {};
        quotationData.value = data;
        allData.customer = data.customer || allData.customer;
        allData.paymentMethod = data.paymentMethod || '';
        allData.installmentPlans = data.installmentPlans || [];
        allData.additionCosts = data.additionCosts || allData.additionCosts;
        allData.carDetails = data.carDetails || allData.carDetails;
        allData.accessories = data.accessories || [];
        // Load the saved template
        selectedTemplate.value = data.templateKey || 'standard';
        
    try {
            store.selectedCar = allData.carDetails;
            if (data.cashPlans) {
                if (typeof store.setCashPlan === 'function') store.setCashPlan(data.cashPlans);
                else store.cashPlan = data.cashPlans;
            }
            if (data.installmentPlans) {
                if (typeof store.setInstallmentPlans === 'function') store.setInstallmentPlans(data.installmentPlans);
                else store.installmentPlans = data.installmentPlans;
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
    showSaveModal.value = true;
};

const selectTemplate = (template) => {
    selectedTemplate.value = template;
};


const handleSaveConfirm = async () => {
    showSaveModal.value = false;

    try {
        const conflict = await checkCustomerDuplicate(allData.customer);
        if (conflict) {
            const proceed = window.confirm('พบเบอร์โทรซ้ำ แต่ชื่อ-สกุลไม่ตรงกับข้อมูลเดิมในระบบ ต้องการบันทึกต่อหรือไม่?');
            if (!proceed) return;
        }

        try {
            console.info('Quotation store snapshot before save:', {
                cashPlan: JSON.parse(JSON.stringify(store.cashPlan || null)),
                installmentPlans: JSON.parse(JSON.stringify(store.installmentPlans || null)),
                paymentMethod: store.paymentMethod ?? allData.paymentMethod,
                selectedCar: JSON.parse(JSON.stringify(store.selectedCar || null)),
            });
        } catch (e) {
            console.info('Quotation store snapshot (partial) before save:', {
                cashPlan: store.cashPlan,
                installmentPlans: store.installmentPlans,
                paymentMethod: store.paymentMethod ?? allData.paymentMethod,
                selectedCar: store.selectedCar,
            });
        }

        const payload = { ...allData };
        const chosenMethod = store.paymentMethod || allData.paymentMethod || null;
        if (chosenMethod && chosenMethod !== allData.paymentMethod) {
            console.warn('Payment method mismatch between local allData and store; using store value', { allData: allData.paymentMethod, store: store.paymentMethod });
        }
        payload.paymentMethod = chosenMethod;

        if (store.cashPlan && Object.keys(store.cashPlan || {}).length > 0) {
            payload.cashPlans = JSON.parse(JSON.stringify(store.cashPlan));
            if (payload.cashPlans.totalPrice) payload.cashPlans.totalPrice = Number(payload.cashPlans.totalPrice);
            if (payload.cashPlans.specialDiscount) payload.cashPlans.specialDiscount = Number(payload.cashPlans.specialDiscount);
            if (payload.cashPlans.additionPrice) payload.cashPlans.additionPrice = Number(payload.cashPlans.additionPrice);
            payload.installmentPlans = [];
        } else if (store.installmentPlans && store.installmentPlans.length > 0) {
            payload.installmentPlans = JSON.parse(JSON.stringify(store.installmentPlans));
            payload.installmentPlans = payload.installmentPlans.map((plan) => ({
                ...plan,
                orderNumber: plan.orderNumber ? Number(plan.orderNumber) : Number(plan.orderNumber ?? 0),
                specialDiscount: plan.specialDiscount ? Number(plan.specialDiscount) : 0,
                additionPrice: plan.additionPrice ? Number(plan.additionPrice) : 0,
                downPaymentPercent: plan.downPaymentPercent ? Number(plan.downPaymentPercent) : 0,
                planDetails: (plan.planDetails || []).map((d) => ({
                    period: Number(d.period),
                    interestRate: d.interestRate === '' || d.interestRate === null || d.interestRate === undefined ? null : Number(d.interestRate)
                }))
            }));
            delete payload.cashPlans;
        } else {
            if (allData.paymentMethod === 'cash') {
                payload.cashPlans = allData.cashPlans || {};
                payload.installmentPlans = [];
            } else if (allData.paymentMethod === 'installment') {
                payload.installmentPlans = allData.installmentPlans || [];
                delete payload.cashPlans;
            }
        }

        if (payload.staffId) payload.staffId = Number(payload.staffId);
        
        // Include the selected template
        payload.templateKey = selectedTemplate.value;


        // Use POST /quotation/create to create a new quotation
        const res = await api.post(`/quotation/create`, payload);
        // New response structure: { statusCode, message, data: { quotationId, ... } }
        const d = res?.data?.data || {};
        const newId = d.quotationId || d.id || null;

        alert('สร้างใบเสนอราคาใหม่เรียบร้อยแล้ว');
        if (newId) {
            await router.push(`/history/${newId}`);
        } else {
            await router.push(`/history`);
        }
    } catch (error) {
        if (error?.response) {
            console.error('Error saving quotation:', error.response.status, error.response.data);
            try { alert('Failed to save: ' + (error.response.data?.message || JSON.stringify(error.response.data))); } catch(e){}
        } else {
            console.error("Error saving quotation:", error);
        }
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
        return;
    } else {
        allData[key] = data;
    }
};
const checkCustomerDuplicate = async (cust) => {
    try {
        const phone = (cust?.phoneNumber || '').trim();
        if (!phone) return false;
        let resp = null;
        try { resp = await api.get(`/customer/phone/${encodeURIComponent(phone)}`); } catch {}
        if (!resp || !resp.data) {
            try { resp = await api.get(`/customer`, { params: { phoneNumber: phone } }); } catch {}
        }
        if (!resp || !resp.data) {
            try { resp = await api.get(`/customer/search`, { params: { phone: phone } }); } catch {}
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