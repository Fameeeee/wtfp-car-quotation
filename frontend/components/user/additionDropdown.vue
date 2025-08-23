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
                <!-- CMI -->
                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">พรบ.</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="additionCosts.cmi ? 'bg-[#980000] text-white' : 'border-2 border-gray-300'"
                            @click="additionCosts.cmi = true">
                            ทำ
                        </div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="!additionCosts.cmi ? 'bg-[#980000] text-white' : 'border-2 border-gray-300'"
                            @click="additionCosts.cmi = false">
                            ไม่ทำ
                        </div>
                    </div>
                </div>

                <!-- Insurance -->
                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ประกันภัย</div>
                    <div class="flex gap-4 w-2/3">
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="additionCosts.insurance ? 'bg-[#980000] text-white' : 'border-2 border-gray-300'"
                            @click="additionCosts.insurance = true">
                            ทำ
                        </div>
                        <div class="cursor-pointer py-2 px-4 rounded-lg text-sm font-semibold"
                            :class="!additionCosts.insurance ? 'bg-[#980000] text-white' : 'border-2 border-gray-300'"
                            @click="additionCosts.insurance = false">
                            ไม่ทำ
                        </div>
                    </div>
                </div>

                <!-- Fuel Value -->
                <div class="flex items-center justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">ค่าน้ำมัน</div>
                    <input type="number" v-model.number="additionCosts.fuelValue" placeholder="ค่าน้ำมัน"
                        class="p-2 border border-gray-300 rounded-lg text-black w-2/3" />
                </div>

                <!-- Note -->
                <div class="flex items-start justify-between text-lg font-medium text-gray-800">
                    <div class="font-semibold text-black">หมายเหตุ</div>
                    <div class="flex flex-col items-end w-2/3">
                        <textarea v-model="additionCosts.note" maxlength="100" placeholder="เพิ่มหมายเหตุ..."
                            class="h-24 p-3 border border-gray-300 rounded-lg text-black resize-none w-full"></textarea>
                        <div class="text-xs text-gray-500 mt-1">{{ additionCosts.note.length }}/100</div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const props = defineProps({
    label: String,
    quotationId: [String, Number],
    modelValue: Object,
});

const open = ref(false);
const additionCosts = ref({
    cmi: false,
    insurance: false,
    fuelValue: 0,
    note: ""
});
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;

const emit = defineEmits(["update"]);

const toggle = () => (open.value = !open.value);

watch(additionCosts, (newVal) => {
  emit("update", newVal);
}, { deep: true });


onMounted(async () => {
    if (props.quotationId) {
        try {
            const res = await axios.get(`${backendUrl}/quotation/${props.quotationId}`);
            if (res.data.additionCosts) {
                additionCosts.value = { ...res.data.additionCosts };
            }
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
