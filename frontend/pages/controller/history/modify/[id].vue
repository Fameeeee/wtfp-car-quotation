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
                        <button @click="closeSaveModal"
                            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">ยกเลิก</button>
                        <button @click="handleSaveConfirm(true)"
                            class="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">บันทึกเป็นใหม่</button>
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
                        <button @click="closeModal"
                            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">ยกเลิก</button>
                        <button @click="discardChanges"
                            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">ทิ้งการเปลี่ยนแปลง</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { ref, reactive, onMounted } from 'vue';
import { getStaffIdAsync } from '~/composables/useAuth'

import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';
import additionDropdown from '~/components/user/additionDropdown.vue';
import customerDropdown from '~/components/user/customerDropdown.vue';

const config = useRuntimeConfig()
const api = useApi();
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

api
    .get(`/quotation/${quotationId}`)
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
        customer: allData.customer || null,
        paymentMethod: allData.paymentMethod || null,
        // treat empty lists as null so backend will clear the field when user removes data
        installmentPlans: Array.isArray(allData.installmentPlans) && allData.installmentPlans.length ? allData.installmentPlans : null,
        cashPlans: allData.cashPlans && Object.keys(allData.cashPlans).length ? allData.cashPlans : null,
        additionCosts: allData.additionCosts && Object.keys(allData.additionCosts).length ? allData.additionCosts : null,
        carDetails: allData.carDetails || null,
        accessories: Array.isArray(allData.accessories) && allData.accessories.length ? allData.accessories : null,
        staffId: allData.staffId || null,
    };

    // normalize payment fields: keep only relevant plan
    if (payload.paymentMethod === 'cash') {
        payload.installmentPlans = [];
    }

    // Ensure numeric types for staffId
    if (payload.staffId) payload.staffId = Number(payload.staffId);

    // Coerce cash numeric fields when present
    if (payload.paymentMethod === 'cash' && payload.cashPlans) {
        try {
            const cp = { ...payload.cashPlans };
            if (cp.totalPrice) cp.totalPrice = Number(cp.totalPrice);
            if (cp.specialDiscount) cp.specialDiscount = Number(cp.specialDiscount);
            // support both additionPrice and specialAddition naming
            if (cp.additionPrice) cp.additionPrice = Number(cp.additionPrice);
            if (cp.specialAddition) cp.specialAddition = Number(cp.specialAddition);
            payload.cashPlans = cp;
        } catch (e) {
            // noop
        }
    }

    // For installment, ensure at least one plan and coerce numeric fields
    if (payload.paymentMethod === 'installment') {
        if (!Array.isArray(payload.installmentPlans) || payload.installmentPlans.length === 0) {
            // create a safe default plan to satisfy backend validation
            payload.installmentPlans = [
                {
                    orderNumber: 1,
                    specialDiscount: 0,
                    additionPrice: 0,
                    downPaymentPercent: 0,
                    planDetails: [{ period: 48, interestRate: 0 }]
                }
            ];
        }

        payload.installmentPlans = (payload.installmentPlans || []).map((plan) => {
            const p = { ...plan };
            if (p.orderNumber) p.orderNumber = Number(p.orderNumber);
            if (p.specialDiscount) p.specialDiscount = Number(p.specialDiscount);
            if (p.additionPrice) p.additionPrice = Number(p.additionPrice);
            if (p.downPaymentPercent) p.downPaymentPercent = Number(p.downPaymentPercent);
            if (Array.isArray(p.planDetails)) {
                p.planDetails = p.planDetails.map((d) => ({
                    period: Number(d.period !== undefined && d.period !== null ? d.period : 0),
                    interestRate: d.interestRate === '' || d.interestRate === null || d.interestRate === undefined ? null : Number(d.interestRate),
                }));
            } else {
                p.planDetails = [{ period: 48, interestRate: null }];
            }
            return p;
        });
    }

    try {
        console.log('Submitting quotation save', { saveAsNew, payload, quotationId });
        // Before creating, coerce and validate payload to avoid server 400 from DTO validation
        const coerceAndValidateForCreate = (p) => {
            // Coerce staffId
            if (p.staffId) p.staffId = Number(p.staffId);

            // Car details price must be a number
            if (p.carDetails && p.carDetails.price !== undefined) {
                p.carDetails.price = Number(p.carDetails.price);
            }

            // Coerce accessory prices
            if (Array.isArray(p.accessories)) {
                p.accessories = p.accessories.map(a => ({ ...a, price: Number(a.price) }));
            }

            // Coerce cash/instalment numeric sub-fields so DTO validation won't fail
            if (p.paymentMethod === 'cash' && p.cashPlans) {
                try {
                    const cp = { ...p.cashPlans };
                    if (cp.totalPrice !== undefined) cp.totalPrice = Number(cp.totalPrice);
                    if (cp.specialDiscount !== undefined) cp.specialDiscount = Number(cp.specialDiscount);
                    if (cp.additionPrice !== undefined) cp.additionPrice = Number(cp.additionPrice);
                    if (cp.specialAddition !== undefined) cp.specialAddition = Number(cp.specialAddition);
                    p.cashPlans = cp;
                } catch (e) { /* noop */ }
            }

            if (p.paymentMethod === 'installment' && Array.isArray(p.installmentPlans)) {
                p.installmentPlans = p.installmentPlans.map((plan, idx) => {
                    const pp = { ...plan };
                    // coerce numeric fields even when 0
                    // normalize/force orderNumber to a number; fallback to index+1 when invalid/missing
                    if (pp.orderNumber !== undefined && pp.orderNumber !== null && pp.orderNumber !== '') {
                        const parsed = Number(String(pp.orderNumber).trim());
                        pp.orderNumber = Number.isNaN(parsed) ? (idx + 1) : parsed;
                    } else {
                        pp.orderNumber = idx + 1;
                    }
                    pp.specialDiscount = pp.specialDiscount !== undefined && pp.specialDiscount !== null ? Number(pp.specialDiscount) : pp.specialDiscount;
                    pp.additionPrice = pp.additionPrice !== undefined && pp.additionPrice !== null ? Number(pp.additionPrice) : pp.additionPrice;
                    pp.downPaymentPercent = pp.downPaymentPercent !== undefined && pp.downPaymentPercent !== null ? Number(pp.downPaymentPercent) : pp.downPaymentPercent;
                    if (Array.isArray(pp.planDetails)) {
                        pp.planDetails = pp.planDetails.map((d, j) => ({
                            period: Number(d.period !== undefined && d.period !== null ? d.period : 0),
                            interestRate: d.interestRate === '' || d.interestRate === null || d.interestRate === undefined ? null : Number(d.interestRate),
                        }));
                    }
                    return pp;
                });
            }

            // Ensure customer phone is a string
            if (p.customer && p.customer.phoneNumber) p.customer.phoneNumber = String(p.customer.phoneNumber).trim();

            const errors = [];
            // Required fields per CreateQuotationDto
            if (!p.paymentMethod) errors.push('paymentMethod is required');
            if (!p.carDetails) errors.push('carDetails is required');
            else {
                // validate all non-empty car fields required by backend DTO
                const cd = p.carDetails || {};
                if (!cd.unitType) errors.push('carDetails.unitType is required');
                if (!cd.modelClass) errors.push('carDetails.modelClass is required');
                if (!cd.modelCodeName) errors.push('carDetails.modelCodeName is required');
                if (!cd.modelGName) errors.push('carDetails.modelGName is required');
                if (cd.price === undefined || cd.price === null || Number.isNaN(Number(cd.price))) errors.push('carDetails.price must be a number');
                if (!cd.color) errors.push('carDetails.color is required');
            }
            if (!p.customer) errors.push('customer is required');
            else {
                if (!p.customer.firstName) errors.push('customer.firstName is required');
                if (!p.customer.lastName) errors.push('customer.lastName is required');
                if (!p.customer.phoneNumber) errors.push('customer.phoneNumber is required');
                else {
                    // basic phone validation similar to backend: digits, spaces, plus, dashes, parens
                    const phoneOk = /^[0-9\s+\-()]+$/.test(String(p.customer.phoneNumber));
                    if (!phoneOk) errors.push('customer.phoneNumber contains invalid characters');
                }
            }
            // For installment, ensure at least one plan and numeric orderNumber
            if (p.paymentMethod === 'installment') {
                if (!Array.isArray(p.installmentPlans) || p.installmentPlans.length === 0) {
                    errors.push('installmentPlans is required for installment payment');
                } else {
                    p.installmentPlans.forEach((pl, i) => {
                        if (pl.orderNumber === undefined || pl.orderNumber === null || Number.isNaN(Number(pl.orderNumber))) {
                            errors.push(`installmentPlans.${i}.orderNumber must be a number`);
                        }
                        if (!Array.isArray(pl.planDetails) || pl.planDetails.length === 0) {
                            errors.push(`installmentPlans.${i}.planDetails is required`);
                        } else {
                            pl.planDetails.forEach((d, j) => {
                                if (Number.isNaN(Number(d.period))) errors.push(`installmentPlans.${i}.planDetails.${j}.period must be a number`);
                                if (Number.isNaN(Number(d.interestRate))) errors.push(`installmentPlans.${i}.planDetails.${j}.interestRate must be a number`);
                            });
                        }
                    });
                }
            }
            if (!p.staffId && p.staffId !== 0) errors.push('staffId is required');

            return { ok: errors.length === 0, errors, payload: p };
        };

        if (saveAsNew) {
            const { ok, errors, payload: cleaned } = coerceAndValidateForCreate(JSON.parse(JSON.stringify(payload)));
            if (!ok) {
                console.warn('Create prevented due to validation errors:', errors, payload);
                alert('ไม่สามารถบันทึกได้: ' + errors.join('; '));
                return;
            }

            const res = await api.post('/quotation/create', cleaned);
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
            await api.put(`/quotation/${Number(quotationId)}`, payload);
            alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
            router.push(`/controller/history/${quotationId}`);
        }
    } catch (error) {
        // Improve diagnostics: show status + body when server returns 400/validation errors
        if (error?.response) {
            console.error('Save failed:', error.response.status, error.response.data);
            const body = error.response.data;
            // Common nest validation response contains 'message' array
            const serverMsg = body?.message || body?.error || body;
            alert('พบข้อผิดพลาดจากเซิร์ฟเวอร์: ' + JSON.stringify(serverMsg));
        } else {
            console.error('Error saving quotation:', error);
            alert('พบข้อผิดพลาด: ' + (error?.message || 'Unknown'));
        }
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
        // Accept and store installmentPlans and cashPlans even when null so the user
        // can clear one when switching payment methods.
        allData.installmentPlans = data.installmentPlans ?? null;
        allData.cashPlans = data.cashPlans ?? null;
    } else {
        allData[key] = data;
    }
};



definePageMeta({
    middleware: 'admin-auth',
    layout: 'admin',
})
</script>