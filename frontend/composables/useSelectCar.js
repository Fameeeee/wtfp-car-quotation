import { ref, watch } from 'vue';

export function useSelectedCar() {
    const selectedCar = ref({
        unitType: '',
        modelClass: '',
        modelCodeName: '',
        modelGname: '',
        price: '',
        color: ''
    });

    if (process.client) {
        const storedCar = localStorage.getItem('selectedCar');
        if (storedCar) {
            selectedCar.value = JSON.parse(storedCar);
        }
    }

    watch(selectedCar, (newValue) => {
        localStorage.setItem('selectedCar', JSON.stringify(newValue));
    }, { deep: true });

    return { selectedCar };
}
