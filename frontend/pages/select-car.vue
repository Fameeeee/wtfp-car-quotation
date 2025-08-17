<template>
    <div class="flex flex-col items-center p-4">
        <div class="text-4xl font-extrabold text-[#696969] my-4">รุ่นรถ</div>
        <div class="flex">
            <selectCar />
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'staff-auth'
})

import selectCar from '~/components/user/selectCar.vue';
</script>
