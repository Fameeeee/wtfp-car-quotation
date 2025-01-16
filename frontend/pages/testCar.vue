<template>
    <div>

        <!-- Unit Type Dropdown -->
        <div>
            <label for="unit-type">Select Unit Type:</label>
            <select v-model="selectedUnitType" @change="fetchModelClasses" id="unit-type">
                <option value="" disabled>Select a unit type</option>
                <option v-for="unit in unitTypes" :key="unit" :value="unit">{{ unit }}</option>
            </select>
        </div>

        <!-- Model Class Dropdown -->
        <div v-if="modelClasses.length > 0">
            <label for="model-class">Select Model Class:</label>
            <select v-model="selectedModelClass" @change="fetchModelCodeName" id="model-class">
                <option value="" disabled>Select a model class</option>
                <option v-for="model in modelClasses" :key="model" :value="model">{{ model }}</option>
            </select>
        </div>

        <!-- Model Code Name Dropdown -->
        <div v-if="modelDetails.modelCodeNames.length > 0">
            <label for="model-code-name">Select Model Code Name:</label>
            <select v-model="selectedModelCodeName" @change="fetchModelGname" id="model-code-name">
                <option value="" disabled>Select a model code name</option>
                <option v-for="code in modelDetails.modelCodeNames" :key="code" :value="code">{{ code }}</option>
            </select>
        </div>

        <!-- Model Gname Dropdown -->
        <div v-if="modelDetails.modelGnames.length > 0">
            <label for="model-gname">Select Model Gname:</label>
            <select v-model="selectedModelGname" @change="fetchPrice" id="model-gname">
                <option value="" disabled>Select a model gname</option>
                <option v-for="gname in modelDetails.modelGnames" :key="gname" :value="gname">{{ gname }}</option>
            </select>
        </div>

        <!-- Price Dropdown -->
        <div v-if="modelDetails.prices.length > 0">
            <label for="price">Select Price:</label>
            <select v-model="selectedPrice" @change="fetchColor" id="price">
                <option value="" disabled>Select a price</option>
                <option v-for="price in modelDetails.prices" :key="price" :value="price">{{ price }}</option>
            </select>
        </div>

        <!-- Color Dropdown -->
        <div v-if="modelDetails.colors.length > 0">
            <label for="color">Select Color:</label>
            <select v-model="selectedColor" id="color">
                <option value="" disabled>Select a color</option>
                <option v-for="color in modelDetails.colors" :key="color" :value="color">{{ color }}</option>
            </select>
        </div>

        <!-- Display Results Below -->
        <div v-if="selectedColor">
            <h3>Selected Information:</h3>
            <p><strong>Unit Type:</strong> {{ selectedUnitType }}</p>
            <p><strong>Model Class:</strong> {{ selectedModelClass }}</p>
            <p><strong>Model Code Name:</strong> {{ selectedModelCodeName }}</p>
            <p><strong>Model Gname:</strong> {{ selectedModelGname }}</p>
            <p><strong>Price:</strong> {{ selectedPrice }}</p>
            <p><strong>Color:</strong> {{ selectedColor }}</p>
        </div>

        <div v-if="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script setup>
definePageMeta({
        middleware: 'auth'
    })
import { ref, onMounted } from 'vue';
import axios from 'axios';

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

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
    error.value = '';
    try {
        const response = await axios.get(`${apiUrl}/model-class?unit-type=${selectedUnitType.value}`);
        modelClasses.value = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model classes for unit-type: ${selectedUnitType.value}`;
        loading.value = false;
    }
};


const fetchModelCodeName = async () => {
    if (!selectedUnitType.value || !selectedModelClass.value) {
        modelDetails.value.modelCodeNames = [];
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const response = await axios.get(
            `${apiUrl}/model-code-name?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}`
        );
        modelDetails.value.modelCodeNames = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model code names for unit-type: ${selectedUnitType.value} and model-class: ${selectedModelClass.value}`;
        loading.value = false;
    }
};


const fetchModelGname = async () => {
    if (!selectedModelCodeName.value) {
        modelDetails.value.modelGnames = [];
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const response = await axios.get(
            `${apiUrl}/model-g-name?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}`
        );
        modelDetails.value.modelGnames = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load model gnames for model-code-name: ${selectedModelCodeName.value}`;
        loading.value = false;
    }
};


const fetchPrice = async () => {
    if (!selectedModelGname.value) {
        modelDetails.value.prices = [];
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const response = await axios.get(
            `${apiUrl}/price?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}&model-gname=${selectedModelGname.value}`
        );
        modelDetails.value.prices = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load prices for model-gname: ${selectedModelGname.value}`;
        loading.value = false;
    }
};


const fetchColor = async () => {
    if (!selectedPrice.value) {
        modelDetails.value.colors = [];
        return;
    }

    loading.value = true;
    error.value = '';
    try {
        const response = await axios.get(
            `${apiUrl}/color?unit-type=${selectedUnitType.value}&model-class=${selectedModelClass.value}&model-code-name=${selectedModelCodeName.value}&model-gname=${selectedModelGname.value}&price=${selectedPrice.value}`
        );
        modelDetails.value.colors = response.data;
        loading.value = false;
    } catch (err) {
        error.value = `Failed to load colors for price: ${selectedPrice.value}`;
        loading.value = false;
    }
};

onMounted(fetchUnitTypes);
</script>

<style scoped>
.error {
    color: red;
}
</style>