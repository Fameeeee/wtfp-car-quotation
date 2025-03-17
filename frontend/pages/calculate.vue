<template>
    <div class="container">
        <div class="topic">กรอกข้อมูล</div>

        <div class="select-payment">
            <button @click="selectedPayment = 'cash'" :class="{ active: selectedPayment === 'cash' }"
                class="cash">ราคาซื้อสด</button>
            <button @click="selectedPayment = 'installment'" :class="{ active: selectedPayment === 'installment' }"
                class="installment">คำนวณเงินผ่อน</button>
        </div>
        <div class="content">
            <cashPayment v-if="selectedPayment === 'cash'" />
            <installmentPayment v-if="selectedPayment === 'installment'" />
        </div>

        <div class="btn">
            <div class="back-btn" @click="goBack">กลับ</div>
            <div class="confirm-btn" @click="goNext">ต่อไป</div>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';

const router = useRouter();
const selectedPayment = ref('cash');
const showModal = ref(false);

const goBack = async () => {
    openModal();
};

const goNext = async () => {
    let dataToSend;
    if (selectedPayment.value === 'cash') {
        dataToSend = JSON.parse(localStorage.getItem('cashPlan'));
        localStorage.removeItem('installmentPlans');
    } else if (selectedPayment.value === 'installment') {
        dataToSend = JSON.parse(localStorage.getItem('installmentPlans'));
        localStorage.removeItem('cashPlan');
    }
    router.push('/select-accessories');
};

const openModal = () => {
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const discardChanges = () => {
    showModal.value = false;
    router.push('/confirm-car');
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
    align-items: center;
    height: 100%;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
    margin-bottom: 10px;
}

.select-payment {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 300px;
    gap: 10px;
    margin-bottom: 20px;
}

.cash,
.installment {
    flex: 1;
    text-align: center;
    font-size: 20px;
    padding: 10px 0;
    border-radius: 20px;
    cursor: pointer;
    transition: 0.3s ease;
    border: 1px solid #000;
    border: none;
}

.cash {
    background: #FFFFFF;
    color: #000000;
}

.installment {
    background: #FFFFFF;
    color: #000000;
}

.cash.active {
    background: #000000;
    color: #FFFFFF;
}

.installment.active {
    background: #000000;
    color: #FFFFFF;
}

.car-details {
    width: 100%;
    max-width: 335px;
    padding: 15px;
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
    text-align: center;
    font-family: 'Lexend Exa', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: #000000;
    margin-bottom: 20px;
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


.confirm-btn {
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
</style>
