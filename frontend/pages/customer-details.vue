<template>
    <div class="flex flex-col items-center p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ข้อมูลลูกค้า</h2>
        <div class="flex flex-col w-full max-w-lg">
            <div class="flex flex-col bg-white p-6 rounded-lg shadow-lg gap-4">
                <div class="flex flex-col items-center justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">ชื่อลูกค้า</div>
                        <input type="text" v-model="customer.firstName" placeholder="ป้อนชื่อลูกค้า"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="handleInput('firstName')" />
                    </div>
                    <div v-if="errors.firstName" class="text-red-500 text-sm mt-1 italic">{{ errors.firstName }}</div>
                </div>

                <div class="flex flex-col items-center justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">นามสกุล</div>
                        <input type="text" v-model="customer.lastName" placeholder="ป้อนนามสกุล"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="handleInput('lastName')" />
                    </div>
                    <div v-if="errors.lastName" class="text-red-500 text-sm mt-1 italic">{{ errors.lastName }}</div>
                </div>

                <div class="flex flex-col items-center justify-between text-lg font-medium text-gray-800">
                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">เบอร์โทรศัพท์</div>
                        <input type="tel" v-model="customer.phoneNumber" placeholder="ป้อนเบอร์โทรศัพท์"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3" inputmode="numeric"
                            pattern="[0-9]*" maxlength="10" autocomplete="tel" @input="handleInput('phoneNumber')" />
                    </div>
                    <div v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1 italic">{{ errors.phoneNumber }}
                    </div>
                </div>

            </div>
        </div>

        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalDiscard v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />
</template>

<script setup>
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';

const router = useRouter();
const quotationStore = useQuotationStore();
const showModal = ref(false);

const customer = ref({
    firstName: '',
    lastName: '',
    phoneNumber: ''
});

const errors = ref({
    firstName: '',
    lastName: '',
    phoneNumber: ''
});

onMounted(() => {
    const saved = quotationStore?.customerDetails || {};
    if (saved && Object.keys(saved).length) {
        customer.value = { ...customer.value, ...saved };
    }
});

const validateField = (field) => {
    if (field === 'firstName') {
        errors.value.firstName = customer.value.firstName ? '' : 'กรุณากรอกชื่อลูกค้า';
    }
    if (field === 'lastName') {
        errors.value.lastName = customer.value.lastName ? '' : 'กรุณากรอกนามสกุล';
    }
    if (field === 'phoneNumber') {
        const phonePattern = /^[0-9]{10}$/;
        errors.value.phoneNumber = phonePattern.test(customer.value.phoneNumber) ? '' : 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)';
    }
};

const handleInput = (field) => {
    if (field === 'phoneNumber') {
        customer.value.phoneNumber = (customer.value.phoneNumber || '').replace(/\D/g, '').slice(0, 10);
    }
    validateField(field);
    try { quotationStore.setCustomerDetails(customer.value); } catch { }
};

const validateForm = () => {
    validateField('firstName');
    validateField('lastName');
    validateField('phoneNumber');

    return !errors.value.firstName && !errors.value.lastName && !errors.value.phoneNumber;
};

const goBack = () => {
    showModal.value = true;
};

const goNext = () => {
    if (validateForm()) {
        router.push('/confirm-quotation');
    }
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    try { quotationStore.setCustomerDetails({}); } catch { }
    router.push('/add-cost');
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>
