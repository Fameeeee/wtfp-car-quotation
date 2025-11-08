<template>
  <div class="w-full border border-black rounded-md font-semibold">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 gap-2 cursor-pointer" @click="toggle">
      <div>{{ label }}</div>
      <svg :class="{ 'rotate-180': open }" class="transition-transform duration-300" width="35" height="35" viewBox="0 0 35 35" fill="none">
        <path d="M10.2083 14.5833L17.4999 21.8749L24.7916 14.5833" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <transition name="slide-fade">
      <div v-if="open" class="p-6 border-t border-black space-y-6 bg-white rounded-lg shadow-md">
        <!-- CMI (พรบ.) -->
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

        <!-- Insurance -->
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

        <!-- Fuel Value with currency suffix -->
        <div class="flex items-center justify-between text-lg font-medium text-gray-800">
          <div class="font-semibold text-black">ค่าน้ำมัน</div>
          <div class="relative w-2/3">
            <input type="number" v-model.number="fuelValue" placeholder="ค่าน้ำมัน"
                   class="p-2 pr-10 border border-gray-300 rounded-lg text-black w-full"
                   @input="emitChange" />
            <span class="absolute inset-y-0 right-3 flex items-center text-gray-600">฿</span>
          </div>
        </div>

        <!-- Warranty fixed text and selectors -->
        <div class="flex flex-col gap-3 text-lg font-medium text-gray-800">
          <div class="font-semibold text-black">หมายเหตุ</div>
          <div v-if="!preferRawNote" class="text-gray-800 leading-relaxed text-sm sm:text-base">
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
              <div class="font-semibold text-black">เงื่อนไขการรับประกัน</div>
              <p class="text-gray-700">การรับประกันผลิตภัณฑ์รถยนต์</p>
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <label for="warrantyYears" class="text-gray-600">ระยะเวลา</label>
                <div class="inline-flex items-center gap-2">
                  <select id="warrantyYears" v-model.number="warrantyYears" @change="emitChange" class="border border-gray-300 rounded px-2 py-1 text-black">
                    <option v-for="y in 7" :key="y" :value="y">{{ y }}</option>
                  </select>
                  <span class="text-gray-700">ปี</span>
                </div>
                <span class="hidden sm:inline text-gray-500">หรือ</span>
                <label for="warrantyKm" class="text-gray-600">ระยะทางสะสม</label>
                <div class="inline-flex items-center gap-2">
                  <select id="warrantyKm" v-model.number="warrantyKm" @change="emitChange" class="border border-gray-300 rounded px-2 py-1 text-black">
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

          <div class="flex flex-col w-full">
            <textarea v-model="noteText" :maxlength="NOTE_MAX_CHARS" placeholder="เพิ่มหมายเหตุเพิ่มเติม..."
                      class="h-24 p-3 border border-gray-300 rounded-lg text-black resize-none w-full"
                      @input="onNoteInput"></textarea>
            <div class="text-xs text-gray-500 mt-1">{{ noteText.length }}/{{ NOTE_MAX_CHARS }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useApi } from '~/composables/useApi'

const props = defineProps({
  label: String,
  quotationId: [String, Number],
  modelValue: Object,
});

const open = ref(false);
const cmiCheck = ref('');
const insuranceCheck = ref('');
const fuelValue = ref('');
const noteText = ref('');
const preferRawNote = ref(false);
const NOTE_MAX_CHARS = 600;
const NOTE_MAX_LINES = 5;
const warrantyYears = ref(3);
const warrantyKm = ref(100000);

const api = useApi();

const emit = defineEmits(["update"]);

const toggle = () => (open.value = !open.value);

const normalizeNote = (text) => {
  if (!text) return '';
  const lines = String(text).split('\n');
  const capped = lines.slice(0, NOTE_MAX_LINES).map(l => l.slice(0, 120));
  return capped.join('\n');
};

const buildFullNote = () => {
  const kmFormatted = Number(warrantyKm.value ?? 0).toLocaleString('th-TH');
  const fixedPart = `รับประกันผลิตภัณท์รถยนต์ ${warrantyYears.value} ปี หรือ ${kmFormatted} กม. แล้วแต่อย่างใดอย่างหนึ่งถึงก่อน\nเงื่อนไขต่างๆอาจมีการเปลี่ยนแปลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า`;
  return noteText.value ? `${fixedPart}\n${normalizeNote(noteText.value)}` : fixedPart;
};

const emitChange = () => {
  const payload = {
    // keep backend compatibility
    cmi: cmiCheck.value === 'do',
    insurance: insuranceCheck.value === 'do',
  fuelValue: Number(fuelValue.value) || 0,
  note: preferRawNote.value ? noteText.value : buildFullNote(),
    // also pass extended fields for UI/state
    cmiCheck: cmiCheck.value,
    insuranceCheck: insuranceCheck.value,
    warrantyYears: warrantyYears.value,
    warrantyKm: warrantyKm.value,
    noteExtra: normalizeNote(noteText.value),
  };
  emit('update', payload);
};

const setCmiCheck = (val) => { cmiCheck.value = val; emitChange(); };
const setInsuranceCheck = (val) => { insuranceCheck.value = val; emitChange(); };

function onNoteInput() {
  noteText.value = normalizeNote(noteText.value);
  emitChange();
}

watch([cmiCheck, insuranceCheck, fuelValue, warrantyYears, warrantyKm], emitChange, { deep: false });

onMounted(async () => {
  if (props.quotationId) {
    try {
      const res = await api.get(`/quotation/${props.quotationId}`);
      const ac = res.data.data.additionCosts || {};
      // map incoming to local fields
      cmiCheck.value = typeof ac.cmi === 'boolean' ? (ac.cmi ? 'do' : 'not_do') : (ac.cmiCheck || '');
      insuranceCheck.value = typeof ac.insurance === 'boolean' ? (ac.insurance ? 'do' : 'not_do') : (ac.insuranceCheck || '');
      fuelValue.value = ac.fuelValue ?? '';
      // Prefer raw composed note when provided from API
      if (ac.note && String(ac.note).trim().length > 0) {
        preferRawNote.value = true;
        noteText.value = ac.note;
      } else if (ac.noteText && String(ac.noteText).trim().length > 0) {
        preferRawNote.value = true;
        noteText.value = ac.noteText;
      } else {
        preferRawNote.value = false;
        noteText.value = ac.noteExtra || '';
      }
      warrantyYears.value = ac.warrantyYears ?? 3;
      warrantyKm.value = ac.warrantyKm ?? 100000;
      emitChange();
    } catch (err) {
      console.error("Error fetching addition costs:", err);
    }
  }
});
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
