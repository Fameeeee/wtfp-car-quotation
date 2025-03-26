<template>
    <div class="flex flex-col items-center p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] mb-5">ค่าใช้จ่ายเพิ่มเติม</h2>
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
                    <input type="number" v-model="fuelValue" placeholder="ป้อนค่าน้ำมัน"
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

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goBack"
                class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">กลับ</button>
            <button @click="goNext" :disabled="!cmiCheck || !insuranceCheck"
                class="py-3 px-4 text-white bg-red-700 rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed">
                ต่อไป
            </button>
            <p v-if="!cmiCheck || !insuranceCheck" class="text-red-500 text-sm mt-2 text-center">
                โปรดเลือก "พรบ." และ "ประกันภัย" ก่อนดำเนินการต่อ
            </p>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 flex justify-center items-center bg-opacity-50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <p class="text-lg text-[#696969] mb-4">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
            <div class="flex gap-4 justify-center">
                <button @click="discardChanges"
                    class="py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-500 hover:to-red-400 transform transition-transform duration-200 hover:scale-105">
                    ยืนยัน
                </button>
                <button @click="closeModal"
                    class="py-3 px-6 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
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
    openModal();
};

const goNext = () => {
    if (!cmiCheck.value || !insuranceCheck.value) return;
    router.push('/customer-details');
};


const openModal = () => {
    showModal.value = true;
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
