<template>
    <div class="form-container">
        <!-- Unit Type Dropdown -->
        <div class="form-group">
            <label class="form-label" for="unit-type">Select Unit Type:</label>
            <div class="group">
                <select v-model="selectedUnitType" @change="fetchModelClasses" id="unit-type" class="form-select">
                    <option value="" disabled>Select a unit type</option>
                    <option v-for="unit in unitTypes" :key="unit" :value="unit">{{ unit }}</option>
                </select>
                <button v-if="selectedUnitType" @click="clearSelection('unitType')" class="remove-btn">Remove</button>
            </div>
        </div>

        <!-- Model Class Dropdown -->
        <div class="form-group" v-if="modelClasses.length > 0">
            <label class="form-label" for="model-class">Select Model Class:</label>
            <div class="group">
                <select v-model="selectedModelClass" @change="fetchModelCodeName" id="model-class" class="form-select">
                    <option value="" disabled>Select a model class</option>
                    <option v-for="model in modelClasses" :key="model" :value="model">{{ model }}</option>
                </select>
                <button v-if="selectedModelClass" @click="clearSelection('modelClass')"
                    class="remove-btn">Remove</button>
            </div>
        </div>

        <!-- Model Code Name Dropdown -->
        <div class="form-group" v-if="modelDetails.modelCodeNames.length > 0">
            <label class="form-label" for="model-code-name">Select Model Code Name:</label>
            <div class="group">
                <select v-model="selectedModelCodeName" @change="fetchModelGname" id="model-code-name"
                    class="form-select">
                    <option value="" disabled>Select a model code name</option>
                    <option v-for="code in modelDetails.modelCodeNames" :key="code" :value="code">{{ code }}</option>
                </select>
                <button v-if="selectedModelCodeName" @click="clearSelection('modelCodeName')"
                    class="remove-btn">Remove</button>
            </div>
        </div>

        <!-- Model Gname Dropdown -->
        <div class="form-group" v-if="modelDetails.modelGnames.length > 0">
            <label class="form-label" for="model-gname">Select Model Gname:</label>
            <div class="group">
                <select v-model="selectedModelGname" @change="handleGnameChange" id="model-gname" class="form-select">
                    <option value="" disabled>Select a model gname</option>
                    <option v-for="gname in modelDetails.modelGnames" :key="gname" :value="gname">{{ gname }}</option>
                </select>
                <button v-if="selectedModelGname" @click="clearSelection('modelGname')"
                    class="remove-btn">Remove</button>
            </div>
        </div>

        <!-- Price Dropdown -->
        <div class="form-group" v-if="modelDetails.prices.length > 0">
            <label class="form-label" for="price">Select Price:</label>
            <div class="group">
                <select v-model="selectedPrice" @change="fetchColor" id="price" class="form-select">
                    <option value="" disabled>Select a price</option>
                    <option v-for="price in modelDetails.prices" :key="price" :value="price">{{ price }}</option>
                </select>
                <button v-if="selectedPrice" @click="clearSelection('price')" class="remove-btn">Remove</button>
            </div>
        </div>

        <!-- Color Dropdown -->
        <div class="form-group" v-if="modelDetails.colors.length > 0 && selectedPrice">
            <label class="form-label" for="color">Select Color:</label>
            <div class="group">
                <select v-model="selectedColor" id="color" class="form-select">
                    <option value="" disabled>Select a color</option>
                    <option v-for="color in modelDetails.colors" :key="color" :value="color">{{ color }}</option>
                </select>
                <button v-if="selectedPrice" @click="clearSelection('color')" class="remove-btn">Remove</button>
            </div>
        </div>


        <!-- Next Button -->
        <button v-if="nextButtonVisible" @click="goToConfirmPage" class="next-btn">Next</button>

        <div v-if="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const router = useRouter();

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
        const response = await axios.get(`${apiUrl}/unit-type`);
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
        const response = await axios.get(`${apiUrl}/model-class?unit-type=${selectedUnitType.value}`);
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
        const response = await axios.get(
            `${apiUrl}/model-code-name?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}`
        );
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
        const response = await axios.get(
            `${apiUrl}/model-g-name?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}`
        );
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
        const response = await axios.get(
            `${apiUrl}/price?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}&model-gname=${selectedModelGname.value}`
        );
        const prices = response.data
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
        const response = await axios.get(
            `${apiUrl}/color?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}&model-gname=${selectedModelGname.value}&price=${selectedPrice.value}`
        );
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
        modelGname: selectedModelGname.value,
        price: selectedPrice.value,
        color: selectedColor.value
    };

    localStorage.setItem('selectedCar', JSON.stringify(selectedData));

    router.push('/confirm-car');
};


onMounted(fetchUnitTypes);
</script>

<style scoped>
.form-container {
    width: 90vw;
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.form-group {
    margin-bottom: 1.5rem;
    position: relative;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    transition: color 0.2s ease;
}

.form-select {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #1f2937;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    appearance: none;
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
}

.form-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.remove-btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    cursor: pointer;
    flex-shrink: 0;
}

.remove-btn:hover {
    background-color: #e5e7eb;
    color: #374151;
}

.next-btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
    margin-top: 2rem;
    font-size: 1rem;
    font-weight: 600;
    color: #ffffff;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.next-btn:active {
    transform: translateY(0);
}

.error {
    margin-top: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #dc2626;
    background-color: #fee2e2;
    border-radius: 0.5rem;
    border: 1px solid #fecaca;
}

.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: #6b7280;
    font-size: 0.875rem;
}

@media (max-width: 640px) {
    .form-container {
        width: 95vw;
        padding: 1.5rem;
        margin: 1rem auto;
    }

    .group {
        flex-direction: column;
        gap: 0.5rem;
    }

    .remove-btn {
        width: 100%;
    }
}
</style>