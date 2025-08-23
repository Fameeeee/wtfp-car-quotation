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
            <div v-if="open" class="p-4 border-t border-black space-y-4">
                <input v-model="searchQuery" @input="searchAccessories" type="text" placeholder="ค้นหาอุปกรณ์"
                    class="w-full p-2 border border-gray-300 rounded-md" />

                <div v-if="searchResults.length">
                    <div v-for="item in searchResults" :key="item.id"
                        class="flex justify-between items-center p-2 mb-2 border rounded border-gray-400 hover:bg-gray-100 cursor-pointer">
                        <div>{{ item.assName }} ({{ item.assType }})</div>
                        <button @click="addAccessory(item)" class="text-green-600 font-semibold">เพิ่ม</button>
                    </div>
                </div>
                <div v-else-if="searchQuery" class="text-gray-500 text-center">ไม่พบอุปกรณ์ที่ค้นหา</div>

                <div v-if="accessories.length">
                    <h4 class="font-semibold mb-2">อุปกรณ์ตกแต่ง</h4>
                    <div v-for="(item, index) in accessories" :key="item.id"
                        class="flex justify-between items-center p-2 border border-gray-400 rounded mb-2">
                        <div>{{ item.assName }} - ฿{{ item.price }}</div>
                        <button @click="removeAccessory(index)"
                            class="px-2 py-1 bg-[#980000] text-white rounded">ลบ</button>
                    </div>
                </div>
                <div v-else class="text-gray-500">No accessories added yet.</div>

                <div class="mt-2 font-bold text-black">ราคารวม: ฿{{ totalPrice.toLocaleString() }}</div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

const props = defineProps({
    label: String,
    quotationId: [String, Number],
});

const open = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const accessories = ref([]);
const carId = ref(null);
const config = useRuntimeConfig();
const backendUrl = config.public.backendUrl;
const apiUrl = config.public.apiUrl;

const toggle = () => (open.value = !open.value);

onMounted(async () => {
    if (backendUrl && props.quotationId) {
        try {
            const { data } = await axios.get(`${backendUrl}/quotation/${props.quotationId}`);
            accessories.value = data.accessories || [];
            const unitType = data.carDetails?.unitType;
            if (unitType) {
                const { data: carData } = await axios.get(
                    `${apiUrl}/standard-base?filter=unitType||$eq||${encodeURIComponent(unitType)}&filter=status||$eq||1`
                );
                if (carData?.length) carId.value = carData[0].id;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});

const searchAccessories = async () => {
    if (!searchQuery.value || !carId.value) {
        searchResults.value = [];
        return;
    }
    try {
        const { data } = await axios.get(`${apiUrl}/standard-base/standard-name/${carId.value}`);
        const allAccessories = (data[0]?.StandardAccBase || []).map(item => ({
            assType: item.accBase.assType,
            assName: item.accBase.assName,
            price: parseFloat(item.accBase.itemCostIncVat) || 0,
            id: item.idAccBase
        }));
        const query = searchQuery.value.toLowerCase();
        const currentNames = accessories.value.map(acc => acc.assName.toLowerCase());
        searchResults.value = allAccessories.filter(
            item => !currentNames.includes(item.assName.toLowerCase()) &&
                item.assName.toLowerCase().includes(query)
        );
    } catch (err) {
        console.error('Error searching accessories:', err);
        searchResults.value = [];
    }
};

const addAccessory = (item) => {
    if (!accessories.value.some(acc => acc.id === item.id)) {
        accessories.value.push(item);
    }
};

const removeAccessory = (index) => {
    accessories.value.splice(index, 1);
};

const totalPrice = computed(() =>
    accessories.value.reduce((sum, item) => sum + item.price, 0)
);
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

.rotate-180 {
    transform: rotate(180deg);
}
</style>