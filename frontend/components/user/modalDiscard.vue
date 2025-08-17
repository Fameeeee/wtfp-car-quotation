<template>
  <div class="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
      <p class="text-lg text-[#696969] mb-4">{{ message }}</p>
      <div class="flex gap-4 justify-center">
        <button @click="$emit('confirm')"
          class="py-3 px-6 text-lg font-semibold text-white bg-[#980000] rounded-lg hover:bg-red-800 transform transition-transform duration-200 hover:scale-105">
          {{ confirmText }}
        </button>
        <button @click="$emit('cancel')"
          class="py-3 px-6 text-lg font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transform transition-transform duration-200 hover:scale-105">
          {{ cancelText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?" },
  confirmText: { type: String, default: "ยืนยัน" },
  cancelText: { type: String, default: "กลับ" }
});
</script>