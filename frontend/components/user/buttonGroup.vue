<template>
    <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
        <button @click="goBack" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
            กลับ
        </button>
        <button @click="goNext" class="py-3 px-4 text-white bg-[#980000] rounded-lg hover:bg-red-800">
            ต่อไป
        </button>
    </div>
</template>

<script setup>
defineProps({
    goBack: Function,
    goNext: Function
});
</script>