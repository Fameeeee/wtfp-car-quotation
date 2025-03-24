<template>
  <div class="container">
    <!-- Cart Popup (Overlay) -->
    <div v-if="showCart" class="cart-popup-overlay">
      <div class="cart-popup">
        <div class="cart-header">
          <h3>Selected Accessories</h3>
          <button class="close-cart" @click="toggleCart">✖</button>
        </div>
        <table class="cart-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>ราคา (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in selectedAccessories" :key="index">
              <td>{{ item.assName }}</td>
              <td>{{ item.price.toLocaleString() }} บาท</td>
              <td><button @click="removeAccessory(item.id)" class="delete-btn">ลบ</button></td>
            </tr>
            <tr>
              <td><strong>ราคาของตกแต่ง</strong></td>
              <td><strong>{{ accessoriesTotal.toLocaleString() }} บาท</strong></td>
            </tr>
            <tr>
              <td><strong>ราคารถ</strong></td>
              <td><strong>{{ carPrice.toLocaleString() }} บาท</strong></td>
            </tr>
            <tr>
              <td><strong>ราคาสุทธิ</strong></td>
              <td><strong>{{ totalPrice.toLocaleString() }} บาท</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="header">

      <div class="title">อุปกรณ์ตกแต่ง</div>
    </div>
    <div class="content">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="type-title">ประเภท</div>
        <div v-for="(assType, index) in assTypes" :key="index" class="type-list" @click="filterAccessories(assType)">
          {{ assType }}
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div class="right-header">
          <input type="text" v-model="searchQuery" placeholder="Search accessories..." class="search-bar" />
          <button class="cart" @click="toggleCart">รถเข็น</button>
        </div>

        <!-- Accessories List -->
        <div v-for="(item, index) in filteredAccessories" :key="index"
          :class="['accessories-list', { 'selected-accessory': selectedAccessories.some(acc => acc.id === item.id) }]"
          @click="toggleAccessory(item)">
          {{ item.assName }} - {{ item.price.toLocaleString() }} บาท
        </div>

      </div>
    </div>
    <div class="btn">
      <button class="goback-btn" @click="goBack"> กลับ </button>
      <button class="confirm-btn" @click="comfirm">ยืนยัน</button>
    </div>
  </div>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <p class="modal-text">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการเปลี่ยนแปลงของคุณ?</p>
      <div class="modal-btn">
        <button @click="discardChanges" class="confirm-btn">ยืนยัน</button>
        <button @click="closeModal" class="back-btn">กลับ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

const assTypes = ref([]);
const accessories = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedAccessories = ref([]);
const showCart = ref(false);
const selectedAssType = ref(null);
const carPrice = ref(0);

const fetchAccessories = async () => {
  const selectedCar = JSON.parse(localStorage.getItem('selectedCar'));
  if (selectedCar && selectedCar.id) {
    try {
      const response = await fetch(`${apiUrl}/standard-base/standard-name/${selectedCar.id}`);
      const data = await response.json();

      accessories.value = data[0].StandardAccBase.map(item => ({
        assType: item.accBase.assType,
        assName: item.accBase.assName,
        price: parseFloat(item.accBase.itemCostIncVat),
        id: item.idAccBase
      }));
      console.log(accessories.value)
      assTypes.value = [...new Set(accessories.value.map(item => item.assType))]
    } catch (error) {
      console.error('Error fetching accessories:', error);
    }
  }
};

onMounted(() => {
  fetchAccessories();
  const storedCar = JSON.parse(localStorage.getItem("selectedCar"));
  if (storedCar && storedCar.price) {
    carPrice.value = parseFloat(storedCar.price);
  }

  const storedAccessories = JSON.parse(localStorage.getItem("selectedAccessories"));
  if (storedAccessories) {
    selectedAccessories.value = storedAccessories;
  }
});

const filteredAccessories = computed(() => {
  return accessories.value
    .filter(item => {
      const matchesType = selectedAssType.value ? item.assType === selectedAssType.value : true;
      const matchesSearchQuery = item.assName.toLowerCase().includes(searchQuery.value.toLowerCase());
      return matchesType && matchesSearchQuery;
    });
});


const filterAccessories = (assType) => {
  selectedAssType.value = assType;
};

const toggleAccessory = (item) => {
  const index = selectedAccessories.value.findIndex(acc => acc.id === item.id);
  if (index !== -1) {
    selectedAccessories.value.splice(index, 1);
  } else {
    selectedAccessories.value.push(item);
  }
  localStorage.setItem("selectedAccessories", JSON.stringify(selectedAccessories.value));
};

const toggleCart = () => {
  showCart.value = !showCart.value;
};

const accessoriesTotal = computed(() => {
  return selectedAccessories.value.reduce((sum, item) => sum + item.price, 0);
});

const totalPrice = computed(() => {
  return carPrice.value + accessoriesTotal.value;
});

const removeAccessory = (id) => {
  selectedAccessories.value = selectedAccessories.value.filter(item => item.id !== id);
  localStorage.setItem('selectedAccessories', JSON.stringify(selectedAccessories.value))
}

const goBack = async () => {
    if (selectedAccessories.value) {
        showModal.value = true;
    } else {
        localStorage.removeItem('selectedAccessories');
        router.push('/calculate');
    }
};

const discardChanges = () => {
    localStorage.removeItem('selectedAccessories');
    router.push('/calculate');
    closeModal();
};

const closeModal = () => {
    showModal.value = false;
};

const comfirm = () => {
  router.push('/add-cost')
}

definePageMeta({
  middleware: 'staff-auth'
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  height: fit-content;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}


.title {
  font-weight: 800;
  font-size: 32px;
  color: #696969;
}

.content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
}

.left-panel {
  width: 30%;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.type-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, #980000 0%, #800000 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(152, 0, 0, 0.2);
}

.type-list {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  margin: 8px 0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-list:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: #980000;
}

.right-panel {
  width: 70%;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.search-bar {
  width: 75%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-bar:focus {
  border-color: #980000;
  box-shadow: 0 0 0 2px rgba(152, 0, 0, 0.1);
}

.cart {
  width: 20%;
  background: linear-gradient(135deg, #980000 0%, #800000 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(152, 0, 0, 0.2);
}

.cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(152, 0, 0, 0.3);
}

.accessories-list {
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin: 10px 0;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.accessories-list:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: #980000;
}

.cart-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.cart-popup {
  background: white;
  padding: 24px;
  border-radius: 16px;
  width: 60%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.cart-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.close-cart {
  background: linear-gradient(135deg, #980000 0%, #800000 100%);
  color: white;
  border: none;
  font-size: 18px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-cart:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(152, 0, 0, 0.3);
}

.cart-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
}

.cart-table th,
.cart-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.cart-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3748;
}

.cart-table tr:last-child td {
  border-bottom: none;
}

.btn {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
    padding: 1rem;
    background: white;
}

.goback-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.confirm {
  padding: 20px;
  background: white;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
}

.confirm-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #980000 0%, #800000 100%);
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(152, 0, 0, 0.2);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(152, 0, 0, 0.3);
}

.selected-accessory {
  background: #f8f9fa;
  border-color: #980000;
  color: #2d3748;
  box-shadow: 0 2px 8px rgba(152, 0, 0, 0.1);
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background-color: white;
    position: absolute;
    display: block;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0.2);
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: fadeIn 0.3s ease-in-out;
    height: 200px;
}

.modal-btn {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-top: 1rem;
}

.confirm-btn{
    flex: 2;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, #980000 0%, #980000 100%);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.back-btn {
    flex: 1;
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #4b5563;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.delete-btn{
  background: #980000;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
  }

  .cart-popup {
    width: 90%;
    margin: 20px;
  }
}
</style>