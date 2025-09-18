<template>
    <ClientOnly>
        <div>
            <div class="flex flex-col items-center h-full p-2">
                <h2 class="text-4xl font-extrabold text-[#696969] my-4">ยืนยันรายการ</h2>
                <div class="w-full max-w-3xl mt-2">
                    <div v-if="pdfLoading" class="flex items-center justify-center h-[60vh] border rounded">
                        <div class="flex items-center gap-2 text-gray-600">
                            <svg class="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                                </path>
                            </svg>
                            <span>กำลังสร้างตัวอย่าง PDF…</span>
                        </div>
                    </div>
                    <div v-else-if="pdfUrl" class="w-full">
                        <!-- Added a small toggle to show full multi-page PDF when needed -->
                        <div class="flex justify-end mb-2">
                            <button @click="toggleFullPreview"
                                class="text-sm px-3 py-1 border rounded hover:bg-gray-100">
                                {{ showFull ? 'แสดงแบบหน้าเดียว' : 'แสดงข้อมูลทั้งหมด' }}
                            </button>
                        </div>
                        <iframe :src="pdfUrl" class="w-full border" style="height: 75vh"></iframe>
                    </div>
                </div>

                <div class="flex flex-col space-y-4 w-full max-w-md mt-4">
                    <button v-if="pdfUrl" @click="openPdfInNewTab"
                        class="py-3 px-4 text-black bg-white rounded-lg border hover:bg-gray-100 flex items-center justify-center gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 3H21V10" stroke="black" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M10 14L21 3" stroke="black" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M21 14V21H3V3H10" stroke="black" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        แท็บใหม่
                    </button>
                    <button @click="goBack"
                        class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                        กลับ
                    </button>
                    <button @click="goNext" class="py-3 px-4 text-white bg-[#980000] rounded-lg hover:bg-red-800">
                        ยืนยัน
                    </button>
                </div>
            </div>

            <modalConfirm v-if="showModal" message="ยืนยันรายการ" confirmText="ยืนยัน" cancelText="กลับ"
                @confirm="confirm" @cancel="closeModal" />
        </div>
    </ClientOnly>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi'
import modalConfirm from '~/components/user/modalConfirm.vue';
import { useRouter } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';
import { getMe, getStaffIdAsync } from '~/composables/useAuth.ts'

const api = useApi();

const router = useRouter();
const quotationStore = useQuotationStore();
const showModal = ref(false);
const staffId = ref(null);
const pdfUrl = ref('');
const pdfLoading = ref(false);
const showFull = ref(false); 
const staffInfo = ref({ firstName: '', lastName: '', phoneNumber: '' });

const goBack = () => {
    router.push('/customer-details');
};

const goNext = () => {
    showModal.value = true;
};

onMounted(async () => {
    const me = await getMe();
    if (me) {
        staffId.value = me.id || me.staffId || null;
        staffInfo.value = {
            firstName: me.firstName || me.given_name || me.name?.split?.(' ')?.[0] || '',
            lastName: me.lastName || me.family_name || me.name?.split?.(' ')?.slice(1).join(' ') || '',
            phoneNumber: me.phoneNumber || me.phone || me.mobile || ''
        };
    } else {
        staffId.value = await getStaffIdAsync();
    }

    try {
        if (staffId.value) await fetchStaffInfo();
    } catch (e) {
        console.warn('Failed to fetch staff info, continue');
    } finally {
        generatePdfPreview();
    }
});

const confirm = async () => {
    showModal.value = false;
    const selectedCar = quotationStore.selectedCar || {};
    const storeCashPlan = quotationStore.cashPlan || {};
    const storeInstallmentPlans = quotationStore.installmentPlans || [];
    const selectedAccessories = quotationStore.selectedAccessories || [];
    const additionCost = quotationStore.additionCost || {};
    const customerDetails = quotationStore.customerDetails || {};

    const hasCash = storeCashPlan && Object.keys(storeCashPlan).length;
    const hasInstallment = storeInstallmentPlans && storeInstallmentPlans.length;
    const chosenMethod = quotationStore.paymentMethod || (hasCash ? 'cash' : (hasInstallment ? 'installment' : null));

    const dataToSend = {
        customer: customerDetails,
        paymentMethod: chosenMethod,
        additionCosts: {
            cmi: additionCost.cmiCheck ? true : false,
            insurance: additionCost.insuranceCheck ? true : false,
            fuelValue: additionCost.fuelValue ? Number(additionCost.fuelValue) : null,
            note: additionCost.noteText || additionCost.noteExtra || null
        },
        carDetails: {
            unitType: selectedCar.unitType,
            modelClass: selectedCar.modelClass,
            modelCodeName: selectedCar.modelCodeName,
            modelGName: selectedCar.modelGName,
            price: Number(selectedCar.price),
            color: selectedCar.color
        },
        accessories: selectedAccessories.map((item) => ({ assType: item.assType, assName: item.assName, price: Number(item.price) })),
        staffId: Number(staffId.value)
    }

    if (dataToSend.paymentMethod === 'cash' && hasCash) {
        dataToSend.cashPlans = {
            totalPrice: storeCashPlan.totalPrice ? Number(storeCashPlan.totalPrice) : storeCashPlan.totalPrice,
            specialDiscount: storeCashPlan.specialDiscount ? Number(storeCashPlan.specialDiscount) : storeCashPlan.specialDiscount,
            additionPrice: storeCashPlan.additionPrice ? Number(storeCashPlan.additionPrice) : storeCashPlan.additionPrice,
            ...storeCashPlan
        };
    } else if (dataToSend.paymentMethod === 'installment' && hasInstallment) {
        dataToSend.installmentPlans = storeInstallmentPlans.map((plan) => ({
            ...plan,
            orderNumber: Number(plan.orderNumber),
            specialDiscount: plan.specialDiscount ? Number(plan.specialDiscount) : plan.specialDiscount,
            additionPrice: plan.additionPrice ? Number(plan.additionPrice) : plan.additionPrice,
            downPaymentPercent: plan.downPaymentPercent ? Number(plan.downPaymentPercent) : plan.downPaymentPercent,
            planDetails: (plan.planDetails || []).map((d) => ({
                period: Number(d.period),
                interestRate: d.interestRate === '' || d.interestRate === null || d.interestRate === undefined ? null : Number(d.interestRate)
            }))
        }));
    }

    if (!staffId.value) {
        console.error('Cannot create quotation: missing staffId (user not authenticated)');
        router.push('/register');
        return;
    }

    console.info('Creating quotation payload:', JSON.parse(JSON.stringify(dataToSend)));

    try {
        const response = await api.post('/quotation/create', dataToSend);
        const quotationId = response.data.quotationId;
        showModal.value = false;
        router.push(`/quotation-success/${quotationId}`);
    } catch (error) {
        if (error && error.response) {
            console.error('Create quotation failed', error.response.status, error.response.data);
        } else {
            console.error('Error creating quotation:', error);
        }
        showModal.value = false;
        try { alert('Failed to create quotation: ' + (error?.response?.data?.message || error?.message || 'Unknown error')); } catch(e){}
    }
}

const closeModal = () => {
    showModal.value = false;
};

const fetchStaffInfo = async () => {
    try {
        if (!staffId.value) return;
    const api = useApi();
    const res = await api.get(`/staff/${staffId.value}`);
        const s = res.data || {};
        staffInfo.value = {
            firstName: s.firstName || staffInfo.value.firstName || '',
            lastName: s.lastName || staffInfo.value.lastName || '',
            phoneNumber: s.phoneNumber || staffInfo.value.phoneNumber || ''
        };
    } catch (e) {
        console.error('Error fetching staff info', e);
    }
};

const buildPreviewPayload = () => {
    const selectedCar = quotationStore.selectedCar || {};
    const storeCashPlan = quotationStore.cashPlan || {};
    const storeInstallmentPlans = quotationStore.installmentPlans || [];
    const selectedAccessories = quotationStore.selectedAccessories || [];
    const additionCost = quotationStore.additionCost || {};
    const customerDetails = quotationStore.customerDetails || {};
    const hasCash = Object.keys(storeCashPlan).length;
    const hasInstallment = storeInstallmentPlans.length;
    const chosenMethod = quotationStore.paymentMethod || (hasCash ? 'cash' : (hasInstallment ? 'installment' : null));

    const base = {
        id: null, 
        quotationDate: new Date().toISOString(),
        customer: customerDetails,
        paymentMethod: chosenMethod,
        additionCosts: {
            cmi: additionCost.cmiCheck ? true : false,
            insurance: additionCost.insuranceCheck ? true : false,
            fuelValue: additionCost.fuelValue ? Number(additionCost.fuelValue) : null,
            note: additionCost.noteText || additionCost.noteExtra || null
        },
        carDetails: {
            unitType: selectedCar.unitType,
            modelClass: selectedCar.modelClass,
            modelCodeName: selectedCar.modelCodeName,
            modelGName: selectedCar.modelGName,
            price: Number(selectedCar.price),
            color: selectedCar.color
        },
        accessories: selectedAccessories.map((item) => ({ assType: item.assType, assName: item.assName, price: Number(item.price) })),
        staff: { ...staffInfo.value }
    };

    if (showFull.value) base.full = true;

    if (base.paymentMethod === 'cash' && hasCash) {
        base.cashPlans = {
            ...storeCashPlan,
            totalPrice: storeCashPlan.totalPrice ? Number(storeCashPlan.totalPrice) : storeCashPlan.totalPrice,
            specialDiscount: storeCashPlan.specialDiscount ? Number(storeCashPlan.specialDiscount) : storeCashPlan.specialDiscount,
            additionPrice: storeCashPlan.additionPrice ? Number(storeCashPlan.additionPrice) : storeCashPlan.additionPrice,
        };
    }
    if (base.paymentMethod === 'installment' && hasInstallment) {
        base.installmentPlans = storeInstallmentPlans.map((plan) => ({
            ...plan,
            orderNumber: Number(plan.orderNumber),
            specialDiscount: plan.specialDiscount ? Number(plan.specialDiscount) : plan.specialDiscount,
            additionPrice: plan.additionPrice ? Number(plan.additionPrice) : plan.additionPrice,
            downPaymentPercent: plan.downPaymentPercent ? Number(plan.downPaymentPercent) : plan.downPaymentPercent,
            planDetails: (plan.planDetails || []).map((d) => ({
                period: Number(d.period),
                interestRate: d.interestRate === '' || d.interestRate === null || d.interestRate === undefined ? null : Number(d.interestRate)
            }))
        }));
    }
    return base;
};

const generatePdfPreview = async () => {
    try {
        pdfLoading.value = true;
        pdfUrl.value = '';
        const payload = buildPreviewPayload();
    const api = useApi();
    const response = await api.post('/quotation/pdf', payload, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: 'application/pdf' });
        pdfUrl.value = URL.createObjectURL(blob);
    } catch (e) {
        console.error('Failed to generate PDF preview', e);
    } finally {
        pdfLoading.value = false;
    }
};

const openPdfInNewTab = () => {
    if (!pdfUrl.value) return;
    window.open(pdfUrl.value, '_blank', 'noopener');
};

function toggleFullPreview() {
    showFull.value = !showFull.value;
    generatePdfPreview();
}



definePageMeta({
    middleware: 'staff-auth'
});
</script>