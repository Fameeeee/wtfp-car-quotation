<template>
    <div class="flex flex-col gap-2">
        <div class="scale-text min-h-[50px] p-1 text-black bg-gray-100 whitespace-pre-wrap break-words overflow-hidden">
            {{ note || 'ไม่มีหมายเหตุ' }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const note = ref('');

onMounted(() => {
    const storedAdditionCost = localStorage.getItem('additionCost');
    if (storedAdditionCost) {
        try {
            const parsed = JSON.parse(storedAdditionCost);
            note.value = parsed.noteText || '';
        } catch (error) {
            console.error('Error parsing additionCost:', error);
        }
    }
});
</script>

<style scoped>
.scale-text {
    font-size: 1rem;
    overflow: hidden;
    line-height: 1.5;
    width: 100%;
    box-sizing: border-box;
    word-break: break-word;
}

@media (max-width: 600px) {
    .scale-text {
        font-size: 0.7rem;
    }
}
</style>