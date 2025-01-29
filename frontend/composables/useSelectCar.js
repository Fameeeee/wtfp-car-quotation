export const useSelectedCar = () => useState('selectedCar', () => ({
    unitType: '',
    modelClass: '',
    modelCodeName: '',
    modelGname: '',
    price: '',
    color: '',
}));
