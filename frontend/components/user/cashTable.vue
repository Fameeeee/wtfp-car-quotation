<template>
    <div class="overflow-x-auto bg-white border shadow-md">
        <table class="min-w-full text-sm text-center text-black">
            <thead class="bg-[#980000]">
                <tr>
                    <th class="px-1 py-1 border scale-text text-white border-black">ส่วนลด</th>
                    <th class="px-1 py-1 border scale-text text-white border-black">ส่วนเพิ่ม</th>
                    <th class="px-1 py-1 border scale-text text-white border-black">ราคาสุทธิ</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.specialDiscount ?? '0' }}</td>
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.specialAddition ?? '0' }}</td>
                    <td class="px-1 py-1 border scale-text">{{ cashPlan.totalPrice }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    cashPlan: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
.overflow-x-auto {
    max-width: 100%;
    max-height: fit-content;
    overflow: auto;
}

table {
    width: 100%;
    table-layout: fixed;
}

.scale-text {
    font-size: 0.8rem;
    overflow: hidden;
    line-height: 1.5;
    width: 100%;
    box-sizing: border-box;
    word-break: break-word;
}

th,
td {
    overflow: hidden;
}

hr {
    margin: 0;
}

@media (max-width: 600px) {
    .scale-text {
        font-size: 0.5rem;
    }
}
</style>