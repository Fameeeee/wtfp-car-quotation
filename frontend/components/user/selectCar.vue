<template>
    <div
        class="w-full max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg transition-all duration-300 ease-in-out">

        <!-- Unit Type Dropdown -->
        <div class="mb-6 relative">
            <label for="unit-type" class="block text-sm font-semibold text-gray-700 mb-2">Select Unit Type:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedUnitType" @change="fetchModelClasses" id="unit-type"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a unit type</option>
                    <option v-for="unit in unitTypes" :key="unit" :value="unit">{{ unit }}</option>
                </select>
                <button v-if="selectedUnitType" @click="clearSelection('unitType')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Model Class Dropdown -->
        <div v-if="modelClasses.length > 0" class="mb-6 relative">
            <label for="model-class" class="block text-sm font-semibold text-gray-700 mb-2">Select Model Class:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedModelClass" @change="fetchModelCodeName" id="model-class"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a model class</option>
                    <option v-for="model in modelClasses" :key="model" :value="model">{{ model }}</option>
                </select>
                <button v-if="selectedModelClass" @click="clearSelection('modelClass')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Model Code Name Dropdown -->
        <div v-if="modelDetails.modelCodeNames.length > 0" class="mb-6 relative">
            <label for="model-code-name" class="block text-sm font-semibold text-gray-700 mb-2">Select Model Code
                Name:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedModelCodeName" @change="fetchModelGname" id="model-code-name"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a model code name</option>
                    <option v-for="code in modelDetails.modelCodeNames" :key="code" :value="code">{{ code }}</option>
                </select>
                <button v-if="selectedModelCodeName" @click="clearSelection('modelCodeName')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Model Gname Dropdown -->
        <div v-if="modelDetails.modelGnames.length > 0" class="mb-6 relative">
            <label for="model-gname" class="block text-sm font-semibold text-gray-700 mb-2">Select Model Gname:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedModelGname" @change="handleGnameChange" id="model-gname"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a model gname</option>
                    <option v-for="gname in modelDetails.modelGnames" :key="gname" :value="gname">{{ gname }}</option>
                </select>
                <button v-if="selectedModelGname" @click="clearSelection('modelGname')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Price Dropdown -->
        <div v-if="modelDetails.prices.length > 0" class="mb-6 relative">
            <label for="price" class="block text-sm font-semibold text-gray-700 mb-2">Select Price:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedPrice" @change="fetchColor" id="price"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a price</option>
                    <option v-for="price in modelDetails.prices" :key="price" :value="price">{{ price }}</option>
                </select>
                <button v-if="selectedPrice" @click="clearSelection('price')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Color Dropdown -->
        <div v-if="modelDetails.colors.length > 0 && selectedPrice" class="mb-6 relative">
            <label for="color" class="block text-sm font-semibold text-gray-700 mb-2">Select Color:</label>
            <div class="flex items-center gap-3">
                <select v-model="selectedColor" id="color"
                    class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="" disabled>Select a color</option>
                    <option v-for="color in modelDetails.colors" :key="color" :value="color">{{ color }}</option>
                </select>
                <button v-if="selectedColor" @click="clearSelection('color')"
                    class="p-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition text-black">ลบ</button>
            </div>
        </div>

        <!-- Next Button -->
        <button v-if="nextButtonVisible" @click="goToConfirmPage"
            class="w-full py-3 text-lg font-semibold text-white bg-[#980000] rounded-lg hover:bg-[#744040] transition">ต่อไป</button>

        <!-- Loading and Error Messages -->
        <div v-if="loading" class="text-gray-500 mt-4">Loading...</div>
        <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuotationStore } from '~/stores/quotation';
import { useApi } from '~/composables/useApi';
import { useExternalApi } from '~/composables/useExternalApi';

const router = useRouter();
const quotationStore = useQuotationStore();
const api = useApi();
const external = useExternalApi();

const unitTypes = ref([]);
const modelClasses = ref([]);
const modelDetails = ref({
    modelCodeNames: [],
    modelGnames: [],
    prices: [],
    colors: []
});
const selectedUnitType = ref('');
const selectedModelClass = ref('');
const selectedModelCodeName = ref('');
const selectedModelGname = ref('');
const selectedPrice = ref('');
const selectedColor = ref('');
const loading = ref(false);
const error = ref('');

const nextButtonVisible = computed(() => {
    return selectedPrice.value && selectedColor.value;
});

const fetchUnitTypes = async () => {
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/unit-type');
        unitTypes.value = response.data;
        loading.value = false;
    } catch (err) {
        error.value = 'Failed to load unit types.';
        loading.value = false;
    }
};

const fetchModelClasses = async () => {
    if (!selectedUnitType.value) {
        modelClasses.value = [];
        return;
    }
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/model-class', { params: { 'unit-type': selectedUnitType.value } });
        modelClasses.value = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model classes`;
        loading.value = false;
    }
};

const fetchModelCodeName = async () => {
    if (!selectedUnitType.value || !selectedModelClass.value) {
        modelDetails.value.modelCodeNames = [];
        return;
    }
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/model-code-name', {
            params: {
                'unit-type': selectedUnitType.value,
                'model-class': selectedModelClass.value,
            },
        });
        modelDetails.value.modelCodeNames = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model code names`;
        loading.value = false;
    }
};


const fetchModelGname = async () => {
    if (!selectedModelCodeName.value) {
        modelDetails.value.modelGnames = [];
        return;
    }
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/model-g-name', {
            params: {
                'unit-type': selectedUnitType.value,
                'model-class': selectedModelClass.value,
                'model-code-name': selectedModelCodeName.value,
            },
        });
        modelDetails.value.modelGnames = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model gnames`;
        loading.value = false;
    }
};

const fetchPrice = async () => {
    if (!selectedModelGname.value) {
        modelDetails.value.prices = [];
        return;
    }
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/price', {
            params: {
                'unit-type': selectedUnitType.value,
                'model-class': selectedModelClass.value,
                'model-code-name': selectedModelCodeName.value,
                'model-gname': selectedModelGname.value,
            },
        });
        const prices = response.data;
        modelDetails.value.prices = prices;
        selectedPrice.value = prices.length > 0 ? prices[0] : '';
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load prices`;
        loading.value = false;
    }
};

const fetchColor = async () => {
    if (!selectedPrice.value) {
        modelDetails.value.colors = [];
        return;
    }
    loading.value = true;
    try {
        const client = external || api;
        const response = await client.get('/model-code/color', {
            params: {
                'unit-type': selectedUnitType.value,
                'model-class': selectedModelClass.value,
                'model-code-name': selectedModelCodeName.value,
                'model-gname': selectedModelGname.value,
                price: selectedPrice.value,
            },
        });
        modelDetails.value.colors = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load colors`;
        loading.value = false;
    }
};

const clearSelection = (level) => {
    switch (level) {
        case 'unitType':
            selectedUnitType.value = '';
            modelClasses.value = [];
            clearSelection('modelClass');
            clearSelection('color')
            break;
        case 'modelClass':
            selectedModelClass.value = '';
            modelDetails.value.modelCodeNames = [];
            clearSelection('modelCodeName');
            clearSelection('color')
            break;
        case 'modelCodeName':
            selectedModelCodeName.value = '';
            modelDetails.value.modelGnames = [];
            clearSelection('modelGname');
            clearSelection('color')
            break;
        case 'modelGname':
            selectedModelGname.value = '';
            modelDetails.value.prices = [];
            clearSelection('price');
            break;
        case 'price':
            selectedPrice.value = '';
            modelDetails.value.colors = [];
            clearSelection('color');
            break;
        case 'color':
            selectedColor.value = '';
            break;
        default:
            break;
    }
};


const handleGnameChange = async () => {
    await fetchPrice();
    fetchColor();
};

const goToConfirmPage = () => {
    const selectedData = {
        unitType: selectedUnitType.value,
        modelClass: selectedModelClass.value,
        modelCodeName: selectedModelCodeName.value,
        modelGName: selectedModelGname.value,
        price: selectedPrice.value,
        color: selectedColor.value
    };
    quotationStore.setSelectedCar(selectedData);
    router.push('/confirm-car');
};


onMounted(fetchUnitTypes);
</script>
