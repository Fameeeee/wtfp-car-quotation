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
    margin: 0 auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
}

.form-group {
    margin-bottom: 1.5rem;
    ;
}

.form-label {
    font-size: 1rem;
    font-weight: bold;
}

.form-select {
    width: 100%;
    padding: 0.5rem;

    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.remove-btn {
    background-color: #f0f0f0;
    border: none;
    padding: 0.3rem 0.6rem;
    font-size: 0.9rem;
    color: #333;
    cursor: pointer;
    border-radius: 5px;
}

.remove-btn:hover {
    background-color: #ddd;
}

.next-btn {
    margin-top: 20px;
    padding: 0.8rem 1.5rem;
    background-color: #4c6ef5;
    color: white;
    border: none;
    border-radius: 0.3rem;
    cursor: pointer;
}

.next-btn:hover {
    background-color: #1a4bdb;
}

.error {
    color: red;
    margin-top: 1rem;
}
</style>