<template>
    <div>
        <h2>Confirm Your Selection</h2>
        <p><strong>Unit Type:</strong> {{ selectedCar.unitType }}</p>
        <p><strong>Model Class:</strong> {{ selectedCar.modelClass }}</p>
        <p><strong>Model Code Name:</strong> {{ selectedCar.modelCodeName }}</p>
        <p><strong>Model Gname:</strong> {{ selectedCar.modelGname }}</p>
        <p><strong>Price:</strong> {{ selectedCar.price }}</p>
        <p><strong>Color:</strong> {{ selectedCar.color }}</p>
        <button @click="confirmSelection">Back</button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useSelectedCar } from '~/composables/useSelectCar';

const router = useRouter();
const selectedCar = useSelectedCar();

const confirmSelection = () => {
    router.push('/select')
};
</script>
