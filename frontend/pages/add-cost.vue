<template>
    <div class="flex flex-col items-center p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ค่าใช้จ่ายเพิ่มเติม</h2>
        <div class="flex flex-col w-full max-w-lg">
            <div class="flex flex-col bg-white p-6 rounded-lg shadow-lg gap-8">
                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">พรบ.</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-red-500 text-white': cmiCheck === 'do', 'border-2 border-gray-300': cmiCheck !== 'do' }"
                            @click="setCmiCheck('do')">ทำ</div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-red-500 text-white': cmiCheck === 'not_do', 'border-2 border-gray-300': cmiCheck !== 'not_do' }"
                            @click="setCmiCheck('not_do')">ไม่ทำ</div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ประกันภัย</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-red-500 text-white': insuranceCheck === 'do', 'border-2 border-gray-300': insuranceCheck !== 'do' }"
                            @click="setInsuranceCheck('do')">ทำ</div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-red-500 text-white': insuranceCheck === 'not_do', 'border-2 border-gray-300': insuranceCheck !== 'not_do' }"
                            @click="setInsuranceCheck('not_do')">ไม่ทำ</div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ค่าน้ำมัน</div>
                    <input type="number" v-model="fuelValue" placeholder="ค่าน้ำมัน"
                        class="p-2 border border-gray-300 rounded-lg text-black w-2/3" @input="saveToLocalStorage" />
                </div>

                <div class="flex items-start justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">หมายเหตุ</div>
                    <div class="flex flex-col items-end w-2/3">
                        <textarea v-model="noteText" maxlength="150" placeholder="เพิ่มหมายเหตุ..."
                            class="h-24 p-3 border border-gray-300 rounded-lg text-black resize-none w-full"
                            @input="saveToLocalStorage"></textarea>
                        <div class="text-xs text-gray-500 mt-1">{{ noteText.length }}/150</div>
                    </div>
                </div>
            </div>
        </div>
        <p v-if="!cmiCheck || !insuranceCheck" class="text-red-500 text-sm mt-4 text-center">
            โปรดเลือก "พรบ." และ "ประกันภัย" ก่อนดำเนินการต่อ
        </p>
        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalConfirm v-if="showModal" message="คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?" confirmText="ยืนยัน"
        cancelText="กลับ" @confirm="discardChanges" @cancel="closeModal" />
</template>

<script setup>
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalConfirm from '~/components/user/modalConfirm.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showModal = ref(false)
const cmiCheck = ref('');
const insuranceCheck = ref('');
const fuelValue = ref('');
const noteText = ref('');

onMounted(() => {
    const savedData = JSON.parse(localStorage.getItem('additionCost')) || {};
    cmiCheck.value = savedData.cmiCheck || '';
    insuranceCheck.value = savedData.insuranceCheck || '';
    fuelValue.value = savedData.fuelValue || '';
    noteText.value = savedData.noteText || '';
});

const saveToLocalStorage = () => {
    const data = {
        cmiCheck: cmiCheck.value,
        insuranceCheck: insuranceCheck.value,
        fuelValue: fuelValue.value,
        noteText: noteText.value
    };
    localStorage.setItem('additionCost', JSON.stringify(data));
};

const setCmiCheck = (value) => {
    cmiCheck.value = value;
    saveToLocalStorage();
};

const setInsuranceCheck = (value) => {
    insuranceCheck.value = value;
    saveToLocalStorage();
};

const goBack = async () => {
    showModal.value = true;
};

const goNext = () => {
    if (!cmiCheck.value || !insuranceCheck.value) return;
    router.push('/customer-details');
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    localStorage.removeItem('additionCost');
    router.push('/select-accessories');
};

definePageMeta({
    middleware: 'staff-auth'
});
</script>
