<template>
    <div class="overflow-x-auto bg-white border shadow-md border-black">
        <table class="min-w-full text-sm text-center text-black">
            <thead class="bg-gray-300">
                <tr>
                    <th class="px-4 py-2 border">รุ่นปีรถ</th>
                    <th class="px-4 py-2 border">รุ่นรถ</th>
                    <th class="px-4 py-2 border">สีตัวถัง</th>
                    <th class="px-4 py-2 border">ราคารถ</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="px-4 py-2 border scale-text">{{ carDetails.modelClass }}</td>
                    <td class="px-4 py-2 border scale-text">{{ carDetails.modelGname }}</td>
                    <td class="px-4 py-2 border scale-text">{{ carDetails.color }}</td>
                    <td class="px-4 py-2 border scale-text">{{ carDetails.price }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const carDetails = ref({
    modelClass: '',
    modelGname: '',
    color: '',
    price: ''
});

onMounted(() => {
    const storedCarDetails = localStorage.getItem('selectedCar');
    if (storedCarDetails) {
        carDetails.value = JSON.parse(storedCarDetails);
    }
});
</script>

<style scoped>
.overflow-x-auto {
    max-width: 100%;
    max-height: 400px;
    overflow: auto;
}

table {
    width: 100%;
    table-layout: fixed;
}

.scale-text {
    font-size: 1rem;
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

@media (max-width: 600px) {
    .scale-text {
        font-size: 0.6rem;
    }
}
</style>
