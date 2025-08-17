<template>
    <div class="overflow-x-auto bg-white border shadow-md">
        <table class="min-w-full text-sm text-center text-black table-fixed">
            <thead class="bg-gray-300">
                <tr>
                    <th class="px-1 py-1 border scale-text w-[10%]">ลำดับ</th>
                    <th class="px-2 py-1 border scale-text w-[40%]">รายการ</th>
                    <th class="px-1 py-1 border scale-text w-[10%]">ลำดับ</th>
                    <th class="px-2 py-1 border scale-text w-[40%]">รายการ</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="index in 10" :key="'row-' + index"
                    :class="{ 'bg-gray-100': index % 2 === 0, 'bg-white': index % 2 !== 0 }">
                    <td class="border px-1 py-1 text-xs scale-text">{{ index }}</td>
                    <td class="border px-2 py-1 text-xs scale-text text-left break-words">{{ leftSide[index - 1]?.name
                        || '' }}</td>
                    <td class="border px-1 py-1 text-xs scale-text">{{ index + 10 }}</td>
                    <td class="border px-2 py-1 text-xs scale-text text-left break-words">{{ rightSide[index - 1]?.name
                        || '' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const leftSide = ref([]);
const rightSide = ref([]);

onMounted(() => {
    const route = useRoute();
    const quotationId = route.params.id;

    if (quotationId) {
        fetchFromApi(quotationId);
    } else {
        fetchFromLocalStorage();
    }
});

const fetchFromLocalStorage = () => {
    const additionCost = JSON.parse(localStorage.getItem('additionCost') || '{}');
    const accessories = JSON.parse(localStorage.getItem('selectedAccessories') || '[]');

    const data = [];
    if (additionCost.cmiCheck) data.push({ name: 'พรบ.' });
    if (additionCost.insuranceCheck) data.push({ name: 'ประกันภัย' });
    if (additionCost.fuelValue) data.push({ name: 'ค่าน้ำมัน ' + additionCost.fuelValue });

    const accessoriesList = accessories.map((item) => ({ name: item.assName }));
    const fullList = [...data, ...accessoriesList].slice(0, 20);

    leftSide.value = fullList.slice(0, 10);
    rightSide.value = fullList.slice(10, 20);
};


const fetchFromApi = async (quotationId) => {
    try {
        const response = await axios.get(`${backendUrl}/quotation/${quotationId}`);
        const apiData = response.data;

        const fullList = [];

        if (apiData.additionCosts) {
            if (apiData.additionCosts.cmi) fullList.push({ name: 'พรบ.' });
            if (apiData.additionCosts.insurance) fullList.push({ name: 'ประกันภัย' });
            if (apiData.additionCosts.fuelValue) fullList.push({ name: `ค่าน้ำมัน ${apiData.additionCosts.fuelValue}` });
        }

        if (apiData.accessories) {
            const accessoriesList = apiData.accessories.map((item) => ({ name: item.assName }));
            fullList.push(...accessoriesList);
        }

        const slicedList = fullList.slice(0, 20);
        leftSide.value = slicedList.slice(0, 10);
        rightSide.value = slicedList.slice(10, 20);
    } catch (error) {
        console.error('Error fetching data from API:', error);
    }
};

</script>

<style scoped>
.scale-text {
    font-size: 0.8rem;
    overflow: hidden;
    line-height: 1.5;
    word-break: break-word;
    box-sizing: border-box;
}

@media (max-width: 600px) {
    .scale-text {
        font-size: 0.5rem;
    }
}

th,
td {
    overflow: hidden;
}
</style>
