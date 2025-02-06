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
              <td>{{ item.name }}</td>
              <td>{{ item.price.toLocaleString() }} บาท</td>
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
      <button class="back-btn" @click="goBack"> &lt; </button>
      <div class="title">อุปกรณ์ตกแต่ง</div>
    </div>
    <div class="content">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="brand-title">แบรนด์</div>
        <div v-for="(brand, index) in brands" :key="index" class="brand-list" @click="filterAccessories(brand)">
          {{ brand }}
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
          {{ item.name }} - {{ item.price.toLocaleString() }} บาท
        </div>

      </div>
    </div>

    <div class="confirm">
      <button class="confirm-btn">ยืนยัน</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Sample Data
const brands = ref(["Toyota", "Honda", "Nissan", "Mazda"]);
const accessories = ref([
  { id: 1, brand: "Toyota", name: "Seat Covers", price: 2000 },
  { id: 2, brand: "Toyota", name: "Steering Wheel Cover", price: 1200 },
  { id: 3, brand: "Honda", name: "Floor Mats", price: 1500 },
  { id: 4, brand: "Honda", name: "Car Cover", price: 2500 },
  { id: 5, brand: "Nissan", name: "Phone Holder", price: 800 },
  { id: 6, brand: "Mazda", name: "Dash Cam", price: 3200 },
  { id: 7, brand: "Mazda", name: "Air Freshener", price: 500 },
]);

const searchQuery = ref('');
const selectedAccessories = ref([]);
const showCart = ref(false);
const selectedBrand = ref(null);
const carPrice = ref(0);

onMounted(() => {
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
  return accessories.value.filter(item =>
    (!selectedBrand.value || item.brand === selectedBrand.value) &&
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filterAccessories = (brand) => {
  selectedBrand.value = brand;
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

const goBack = () => {
  router.push('/confirm-car');
  localStorage.removeItem('selectedAccessories')
};

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

.back-btn {
  position: absolute;
  left: 20px;
  background: linear-gradient(135deg, #980000 0%, #800000 100%);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(152, 0, 0, 0.2);
}

.back-btn:hover {
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(152, 0, 0, 0.3);
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

.brand-title {
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

.brand-list {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  margin: 8px 0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.brand-list:hover {
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
