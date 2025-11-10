<template>
    <div class="w-full border border-black rounded-md font-semibold">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 gap-2 cursor-pointer" @click="toggle">
            <div>{{ label }}</div>
            <svg :class="{ 'rotate-180': open }" class="transition-transform duration-300" width="35" height="35"
                viewBox="0 0 35 35" fill="none">
                <path d="M10.2083 14.5833L17.4999 21.8749L24.7916 14.5833" stroke="black" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </div>

        <transition name="slide-fade">
            <div v-if="open" class="p-6 border-t border-black space-y-6 bg-white rounded-lg shadow-md">
                <div class="flex flex-col gap-4">
                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">ชื่อลูกค้า</div>
                        <input type="text" v-model="customer.firstName" placeholder="ป้อนชื่อลูกค้า"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="handleInput('firstName')" />
                    </div>
                    <div v-if="errors.firstName" class="text-red-500 text-sm italic">{{ errors.firstName }}</div>

                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">นามสกุล</div>
                        <input type="text" v-model="customer.lastName" placeholder="ป้อนนามสกุล"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3"
                            @input="handleInput('lastName')" />
                    </div>
                    <div v-if="errors.lastName" class="text-red-500 text-sm italic">{{ errors.lastName }}</div>

                    <div class="flex items-center justify-between w-full">
                        <div class="font-semibold text-black">เบอร์โทรศัพท์</div>
                        <input type="tel" v-model="customer.phoneNumber" placeholder="ป้อนเบอร์โทรศัพท์"
                            class="p-2 border border-gray-300 rounded-lg text-gray-700 w-2/3" maxlength="10"
                            @input="handlePhoneInput" />
                    </div>
                    <div v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1 italic">
                        {{ errors.phoneNumber }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useApi } from "~/composables/useApi";
import { useNotification } from '~/composables/useNotification';

const props = defineProps({
    label: String,
    quotationId: [String, Number],
    modelValue: Object,
});

const open = ref(false);
const customer = ref({
    firstName: "",
    lastName: "",
    phoneNumber: "",
});
const errors = ref({});
const config = useRuntimeConfig();
const api = useApi();
const toast = useNotification();
const emit = defineEmits(['update']);

const localData = ref({ ...props.modelValue });
let duplicateCheckTimer = null;
let lastCheckSeq = 0;
const initialCustomer = ref({ firstName: '', lastName: '', phoneNumber: '' });

const toggle = () => (open.value = !open.value);
const handleInput = (field) => {
    if (customer.value[field].trim() === "") {
        errors.value[field] = `โปรดป้อน${field === 'firstName' ? 'ชื่อ' : field === 'lastName' ? 'นามสกุล' : 'เบอร์โทรศัพท์'}`;
    } else {
        errors.value[field] = "";
    }
};
const handlePhoneInput = (e) => {
    customer.value.phoneNumber = e.target.value.replace(/\D/g, "");
};

onMounted(async () => {
    if (props.quotationId) {
        try {
            const res = await api.get(`/quotation/${props.quotationId}`);
            if (res.data.data.customer) {
                customer.value = { ...res.data.data.customer };
                initialCustomer.value = { ...customer.value };
            }
        } catch (err) {
            console.error("Error fetching customer data:", err);
            toast.error('ไม่สามารถโหลดข้อมูลลูกค้าได้');
        }
    }
});

watch(customer, (newVal) => {
    emit("update", newVal);
}, { deep: true });

// Debounced duplicate check when phone/name changes
watch(() => [customer.value.phoneNumber, customer.value.firstName, customer.value.lastName], () => {
    if (duplicateCheckTimer) clearTimeout(duplicateCheckTimer);
    duplicateCheckTimer = setTimeout(runDuplicateCheck, 300);
});

async function runDuplicateCheck() {
    try {
        const phone = (customer.value.phoneNumber || '').trim();
        const first = (customer.value.firstName || '').trim();
        const last = (customer.value.lastName || '').trim();

        // Only validate when user changed something compared to the initially loaded values
        const changed = phone !== (initialCustomer.value.phoneNumber || '').trim()
            || first !== (initialCustomer.value.firstName || '').trim()
            || last !== (initialCustomer.value.lastName || '').trim();
        if (!changed) {
            return; // don't show duplicate errors for unchanged data
        }

        if (!phone || phone.length < 10) {
            // don't validate until there's a likely complete number
            return;
        }

        const mySeq = ++lastCheckSeq;
        const records = await lookupCustomersByPhone(phone);
        if (mySeq !== lastCheckSeq) return; // stale result

        const norm = (s) => String(s || '').trim().toLowerCase();
        const phoneMatches = records.filter(r => norm(r.phoneNumber) === norm(phone));
        const nameMatches = phoneMatches.filter(r => norm(r.firstName) === norm(first) && norm(r.lastName) === norm(last));

        if (phoneMatches.length > 0 && nameMatches.length === 0) {
            // Same phone exists but name mismatch
            errors.value.phoneNumber = 'เบอร์นี้มีอยู่ในระบบ แต่ชื่อ-นามสกุลไม่ตรงกับข้อมูลเดิม';
        } else if (phoneMatches.length > 0 && nameMatches.length > 0) {
            // Matched existing customer exactly -> OK
            if (errors.value.phoneNumber?.includes('เบอร์นี้')) errors.value.phoneNumber = '';
        } else if (phoneMatches.length > 0) {
            errors.value.phoneNumber = 'เบอร์โทรศัพท์นี้ถูกใช้แล้ว';
        } else {
            if (errors.value.phoneNumber?.includes('เบอร์')) errors.value.phoneNumber = '';
        }
    } catch (e) {
        // Non-blocking: silently ignore network issues
    }
}

async function lookupCustomersByPhone(phone) {
    try {
        const resp = await api.get(`/customer`, { params: { search: phone, page: 1, limit: 50 } });
        const payload = resp?.data;
        // Backend returns { data, total, page, limit, totalPages }
        const list = Array.isArray(payload?.data) ? payload.data : [];
        return list;
    } catch {
        return [];
    }
}

</script>


<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
}
</style>
