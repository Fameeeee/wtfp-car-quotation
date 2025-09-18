<template>
    <div class="flex flex-col items-center p-4">
        <div class="text-4xl font-extrabold text-[#696969] my-4">หน้าหลัก</div>

        <div class="flex flex-col gap-5">
            <NuxtLink to="/select-car" class="w-full">
                <button
                    class="flex justify-center items-center w-full h-24 px-5 bg-white border border-gray-500 rounded-2xl shadow-md hover:bg-gray-100 transition">
                    <span class="text-2xl font-semibold text-[#696969]">สร้างใบเสนอราคา</span>
                </button>
            </NuxtLink>

            <NuxtLink to="/history" class="w-full">
                <button
                    class="flex justify-center items-center w-full h-24 px-5 bg-white border border-gray-500 rounded-2xl shadow-md hover:bg-gray-100 transition">
                    <span class="text-2xl font-semibold text-[#696969]">ประวัติการทำรายการ</span>
                </button>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'staff-auth'
})
</script>
