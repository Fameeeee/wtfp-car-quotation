<template>
    <div class="flex flex-col items-center p-4">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ค่าใช้จ่ายเพิ่มเติม</h2>
        <div class="flex flex-col w-full max-w-lg">
            <div class="flex flex-col bg-white p-6 rounded-lg shadow-lg gap-8">
                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">พรบ.</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-[#980000] text-white': cmiCheck === 'do', 'border-2 border-gray-300': cmiCheck !== 'do' }"
                            @click="setCmiCheck('do')">ทำ</div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-[#980000] text-white': cmiCheck === 'not_do', 'border-2 border-gray-300': cmiCheck !== 'not_do' }"
                            @click="setCmiCheck('not_do')">ไม่ทำ</div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ประกันภัย</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-[#980000] text-white': insuranceCheck === 'do', 'border-2 border-gray-300': insuranceCheck !== 'do' }"
                            @click="setInsuranceCheck('do')">ทำ</div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="{ 'bg-[#980000] text-white': insuranceCheck === 'not_do', 'border-2 border-gray-300': insuranceCheck !== 'not_do' }"
                            @click="setInsuranceCheck('not_do')">ไม่ทำ</div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ค่าน้ำมัน</div>
                    <div class="relative w-2/3">
                        <input type="number" v-model="fuelValue" placeholder="ค่าน้ำมัน"
                            class="p-2 pr-10 border border-gray-300 rounded-lg text-black w-full"
                            @input="saveToStore" />
                        <span class="absolute inset-y-0 right-3 flex items-center text-gray-600">฿</span>
                    </div>
                </div>

                <!-- Warranty fixed text with dropdowns -->
                <div class="flex flex-col gap-3 text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">หมายเหตุ</div>
                    <div class="text-gray-800 leading-relaxed text-sm sm:text-base">
                        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                            <div class="font-semibold text-black">เงื่อนไขการรับประกัน</div>
                            <p class="text-gray-700">การรับประกันผลิตภัณฑ์รถยนต์</p>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                                <label for="warrantyYears" class="text-gray-600">ระยะเวลา</label>
                                <div class="inline-flex items-center gap-2">
                                    <select id="warrantyYears" v-model.number="warrantyYears"
                                        @change="saveToStore"
                                        class="border border-gray-300 rounded px-2 py-1 text-black">
                                        <option v-for="y in 7" :key="y" :value="y">{{ y }}</option>
                                    </select>
                                    <span class="text-gray-700">ปี</span>
                                </div>
                                <span class="hidden sm:inline text-gray-500">หรือ</span>
                                <label for="warrantyKm" class="text-gray-600">ระยะทางสะสม</label>
                                <div class="inline-flex items-center gap-2">
                                    <select id="warrantyKm" v-model.number="warrantyKm" @change="saveToStore"
                                        class="border border-gray-300 rounded px-2 py-1 text-black">
                                        <option :value="100000">100,000</option>
                                        <option :value="200000">200,000</option>
                                        <option :value="300000">300,000</option>
                                        <option :value="400000">400,000</option>
                                        <option :value="500000">500,000</option>
                                        <option :value="600000">600,000</option>
                                        <option :value="700000">700,000</option>
                                        <option :value="800000">800,000</option>
                                        <option :value="900000">900,000</option>
                                    </select>
                                    <span class="text-gray-700">กม.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Free text area below fixed text -->
                    <div class="flex flex-col w-full">
                        <textarea v-model="noteText" :maxlength="NOTE_MAX_CHARS" placeholder="เพิ่มหมายเหตุเพิ่มเติม..."
                            class="h-24 p-3 border border-gray-300 rounded-lg text-black resize-none w-full"
                            @input="onNoteInput"></textarea>
                        <div class="text-xs text-gray-500 mt-1">{{ noteText.length }}/{{ NOTE_MAX_CHARS }}</div>
                    </div>
                </div>
            </div>
        </div>
        <p v-if="!cmiCheck || !insuranceCheck" class="text-red-500 text-sm mt-4 text-center">
            โปรดเลือกสถานะของ "พรบ." และ "ประกันภัย" ก่อนดำเนินการต่อ
        </p>
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
const showModal = ref(false)
const cmiCheck = ref('');
const insuranceCheck = ref('');
const fuelValue = ref('');
const noteText = ref('');
const NOTE_MAX_CHARS = 600;
const NOTE_MAX_LINES = 5;
const warrantyYears = ref(3);
const warrantyKm = ref(100000);

const buildFullNote = () => {
    // Use the exact phrasing requested and append the textarea content
    const kmFormatted = Number(warrantyKm.value ?? 0).toLocaleString('th-TH');
    const fixedPart = `รับประกันผลิตภัณท์รถยนต์ ${warrantyYears.value} ปี หรือ ${kmFormatted} กม. แล้วแต่อย่างใดอย่างหนึ่งถึงก่อน\nเงื่อนไขต่างๆอาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า`;
    return noteText.value ? `${fixedPart}\n${noteText.value}` : fixedPart;
};

onMounted(() => {
    const savedData = quotationStore?.additionCost || {};
    cmiCheck.value = savedData.cmiCheck || '';
    insuranceCheck.value = savedData.insuranceCheck || '';
    fuelValue.value = savedData.fuelValue || '';
    noteText.value = savedData.noteExtra || '';
});

const normalizeNote = (text) => {
    if (!text) return '';
    // Enforce max lines and per-line length; no global char cap
    const lines = String(text).split('\n');
    const capped = lines.slice(0, NOTE_MAX_LINES).map(l => l.slice(0, 120));
    return capped.join('\n');
};

const saveToStore = () => {
    try {
        quotationStore.setAdditionCost({
            cmiCheck: cmiCheck.value,
            insuranceCheck: insuranceCheck.value,
            fuelValue: fuelValue.value,
            noteExtra: normalizeNote(noteText.value)
        });
    } catch {}
};

const setCmiCheck = (value) => {
    cmiCheck.value = value;
    saveToStore();
};

const setInsuranceCheck = (value) => {
    insuranceCheck.value = value;
    saveToStore();
};

const goBack = async () => {
    showModal.value = true;
};

const goNext = () => {
    if (!cmiCheck.value || !insuranceCheck.value) return;
    const finalNote = buildFullNote();
    const current = quotationStore?.additionCost || {};
    quotationStore.setAdditionCost({
        ...current,
        cmiCheck: cmiCheck.value,
        insuranceCheck: insuranceCheck.value,
        fuelValue: fuelValue.value,
    noteText: normalizeNote(finalNote)
    });
    router.push('/customer-details');
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    try { quotationStore.setAdditionCost({}); } catch { }
    router.push('/select-accessories');
};

definePageMeta({
    middleware: 'staff-auth'
});

function onNoteInput() {
    // Enforce limits live and keep store in sync
    noteText.value = normalizeNote(noteText.value);
    saveToStore();
}
</script>
