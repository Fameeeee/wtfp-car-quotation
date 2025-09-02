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
            <div v-if="open" class="p-6 border-t border-black space-y-6 bg-white rounded-lg shadow-md">
                <input v-model="searchQuery" type="text" placeholder="ค้นหาอุปกรณ์"
                    class="w-full p-2 border border-gray-300 rounded-md" />

                <div v-if="searchQuery" class="w-full bg-white rounded-lg mt-2 max-h-60 overflow-auto border border-gray-200">
                    <div v-for="item in filteredAccessories" :key="item.id"
                        class="p-2 border-b flex items-center justify-between hover:bg-gray-100">
                        <div class="flex flex-col">
                            <span class="text-black font-medium">{{ item.assName }}</span>
                            <span class="text-black text-sm">{{ item.price.toLocaleString() }} ฿</span>
                        </div>
                        <button class="px-3 py-1 text-white bg-black rounded-md hover:bg-gray-800" @click.stop="addAccessory(item)">
                            เพิ่ม
                        </button>
                    </div>
                    <div v-if="filteredAccessories.length === 0" class="p-3 text-gray-500 text-center">
                        ไม่พบอุปกรณ์ที่ค้นหา
                    </div>
                </div>

                <div v-if="accessories.length">
                    <h4 class="font-semibold mb-2">อุปกรณ์ตกแต่ง</h4>
                    <div v-for="(item, index) in accessories" :key="item.id"
                        class="flex justify-between items-center p-2 border border-gray-400 rounded mb-2">
                        <div>{{ item.assName }} - ฿{{ (item.price != null && item.price.toLocaleString) ? item.price.toLocaleString() : item.price }}</div>
                        <button @click="removeAccessory(index)"
                            class="px-2 py-1 bg-[#980000] text-white rounded cursor-pointer">ลบ</button>
                    </div>
                </div>
                <div v-else class="text-gray-500">No accessories added yet.</div>

                <div class="mt-2 font-bold text-black">ราคารวม: ฿{{ totalPrice.toLocaleString() }}</div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useApi } from '~/composables/useApi'
import { useExternalApi } from '~/composables/useExternalApi'

const props = defineProps({
    label: String,
    quotationId: [String, Number],
    modelValue: Object,
});

const open = ref(false);
const searchQuery = ref("");
const allAccessories = ref([]);
const accessories = ref([]);
const carId = ref(null);
const api = useApi();
const externalApi = useExternalApi();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const toggle = () => (open.value = !open.value);

onMounted(async () => {
    if (props.quotationId) {
        try {
            const { data } = await api.get(`/quotation/${props.quotationId}`);
            accessories.value = data.accessories || [];
            const unitType = data.carDetails?.unitType;
                if (unitType) {
                // Prefer external API for catalog lookups; fallback to backend if missing
                let carDataResp = null;
                if (externalApi) {
                    carDataResp = await externalApi.get(`/standard-base?filter=unitType||$eq||${encodeURIComponent(unitType)}&filter=status||$eq||1`);
                } else {
                    carDataResp = await api.get(`/standard-base?filter=unitType||$eq||${encodeURIComponent(unitType)}&filter=status||$eq||1`);
                }
                const carData = carDataResp?.data;
                if (carData?.length) carId.value = carData[0].id;
                // fetch all accessories for this car once
                if (carId.value) {
                    try {
                        // Prefer external API when available (API_URL from runtime config)
                        let listResp = null;
                        if (externalApi) {
                            listResp = await externalApi.get(`/standard-base/standard-name/${carId.value}`);
                        } else {
                            listResp = await api.get(`/standard-base/standard-name/${carId.value}`);
                        }
                        const list = listResp?.data;
                        allAccessories.value = (list?.[0]?.StandardAccBase || []).map(item => ({
                            assType: item.accBase.assType,
                            assName: item.accBase.assName,
                            price: parseFloat(item.accBase.itemCostIncVat) || 0,
                            id: item.idAccBase
                        }));

                        if (accessories.value && accessories.value.length) {
                            accessories.value = accessories.value.map(a => {
                                const priceNum = Number(a.price || 0);
                                const keyName = (a.assName || '').toString();
                                const keyType = (a.assType || '').toString();
                                const match = allAccessories.value.find(x => x.assName === keyName && x.assType === keyType && (Number(x.price) === Number(priceNum) || !x.price));
                                return {
                                    assType: keyType,
                                    assName: keyName,
                                    price: priceNum,
                                    id: match ? match.id : (a.id ?? null)
                                };
                            });
                        }
                    } catch (e) {
                        console.error('Error fetching accessories list:', e);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});

// Suggestions: show all items (including standard) that are not currently selected
const filteredAccessories = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    // Use name+type key to determine selection so items that came from the DB (without id)
    // still correctly exclude matching catalog items.
    const selectedKeys = new Set(accessories.value.map(a => `${(a.assName||'').toString()}::${(a.assType||'').toString()}`));
    return allAccessories.value.filter(item => {
        const key = `${item.assName}::${item.assType}`;
        if (selectedKeys.has(key)) return false;
        if (q === '') return true;
        return item.assName.toLowerCase().includes(q) || item.assType.toLowerCase().includes(q);
    });
});

const addAccessory = (item) => {
    // normalize shape when adding so selected list matches expected backend shape
    const normalized = { assType: item.assType, assName: item.assName, price: Number(item.price || 0), id: item.id ?? null };
    const key = `${normalized.assName}::${normalized.assType}`;
    const exists = accessories.value.some(a => `${(a.assName||'').toString()}::${(a.assType||'').toString()}` === key);
    if (!exists) {
        accessories.value.push(normalized);
    }
    // clear search after adding, like a picker UX
    searchQuery.value = '';
};

const removeAccessory = (index) => {
    accessories.value.splice(index, 1);
};

const totalPrice = computed(() =>
    accessories.value.reduce((sum, item) => sum + item.price, 0)
);

const emit = defineEmits(["update"]);

watch(accessories, (newVal) => {
  emit("update", newVal); 
}, { deep: true });

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
</style>