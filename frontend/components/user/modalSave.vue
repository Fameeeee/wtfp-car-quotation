<template>
    <div class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
            <p class="text-lg text-[#696969] mb-4">คุณต้องการบันทึกสิ่งนี้ใช่ไหม?</p>

            <label class="flex items-center justify-center gap-2 mb-4 text-sm">
                <input type="checkbox" v-model="saveAsNew" class="w-5 h-5" />
                <span class="text-gray-700">บันทึกเป็นใบเสนอราคาใหม่</span>
            </label>

            <div class="flex gap-4 justify-center">
                <button @click="confirm"
                    class="py-3 px-6 text-lg font-semibold text-white bg-[#980000] rounded-lg hover:bg-red-800 transform transition-transform duration-200 hover:scale-105">
                    บันทึก
                </button>
                <button @click="cancel"
                    class="py-3 px-6 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
                    กลับ
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    message: String
})

const emit = defineEmits(['confirm', 'cancel']);

const saveAsNew = ref(false);

const confirm = () => {
    emit('confirm', saveAsNew.value)
}

const cancel = () => {
    emit('cancel')
}
</script>
