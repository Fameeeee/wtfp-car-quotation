<template>
    <div class="flex text-black flex-col items-center justify-center w-full h-full p-8 gap-5">
        <DropdownItem label="รุ่นรถ" :quotation-id="quotationId">
            <template #default="{ data }">
                <div class="flex flex-col">
                    <div class="p-2 flex flex-col gap-2 ">
                        <label class="block text-black text-sm">Unit Type</label>
                        <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.unitType }}</div>
                    </div>
                    <div class="p-2 flex flex-col gap-2 ">
                        <label class="block text-black text-sm">Model Class</label>
                        <div class=" w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.modelClass }}</div>
                    </div>
                    <div class="p-2 flex flex-col gap-2">
                        <label class="block text-black text-sm">Model Code Name</label>
                        <div class=" w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.modelCodeName }}
                        </div>
                    </div>
                    <div class="p-2 flex flex-col gap-2">
                        <label class="block text-black text-sm">Model G Name</label>
                        <div class=" w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.modelGName }}</div>
                    </div>
                    <div class="p-2 flex flex-col gap-2">
                        <label class="block text-black text-sm">Color</label>
                        <div class=" w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.color }}</div>
                    </div>
                    <div class="p-2 flex flex-col gap-2">
                        <label class="block text-black text-sm">Price</label>
                        <div class="w-full bg-gray-200 border border-gray-400 rounded p-2 ">{{ data.price }}</div>
                    </div>
                </div>
            </template>
        </DropdownItem>

        <paymentDropdown label="รูปแบบการชำระเงิน"  :quotation-id="quotationId"
            @update="handleUpdate" />

        <accessoriesDropdown label="อุปกรณ์ตกแต่ง"  :quotation-id="quotationId"/>



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
</template>

<script setup>``
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';
import modalDiscard from '~/components/user/modalDiscard.vue';
import buttonGroup from '~/components/user/buttonGroup.vue';
import DropdownItem from '~/components/user/dropdownItem.vue';
import paymentDropdown from '~/components/user/paymentDropdown.vue';
import accessoriesDropdown from '~/components/user/accessoriesDropdown.vue';

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const paymentPlan = ref('');
const cashPlan = ref({});
const installmentPlans = ref([]);
const showModal = ref(false);

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

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
        console.log('Quotation data fetched successfully:', response.data);
    })
    .catch((error) => {
        console.error('Error fetching quotation data:', error);
    });

const goBack = () => {
    showModal.value = true;
};

const goNext = () => {
    showModal.value = true
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    router.push('/history');
};

const paymentData = ref({});

const handleUpdate = (data) => {
    paymentData.value = data; // keep the latest edited values
    console.log("Updated Payment Data:", paymentData.value);
};
</script>