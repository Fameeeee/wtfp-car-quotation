<template>
    <div class="container">
        <div class="topic">กรอกข้อมูล</div>

        <div class="select-payment">
            <button @click="selectedPayment = 'cash'" :class="{ active: selectedPayment === 'cash' }"
                class="sod">ราคาซื้อสด</button>
            <button @click="selectedPayment = 'installment'" :class="{ active: selectedPayment === 'installment' }"
                class="pon">คำนวณเงินผ่อน</button>
        </div>

        <div class="car-details">
            V-Cross
        </div>

        <div class="content">
            <cashPayment v-if="selectedPayment === 'cash'" />
            <installmentPayment v-if="selectedPayment === 'installment'" />
        </div>

        <div class="btn">
            <div class="back-btn" @click="goBack">Back</div>
            <div class="confirm-btn">Confirm</div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import cashPayment from '~/components/user/cashPayment.vue';
import installmentPayment from '~/components/user/installmentPayment.vue';

const router = useRouter();

const goBack = async () => {
    router.push('/confirm-accessories');
};

definePageMeta({
    middleware: 'staff-auth'
});

const selectedPayment = ref('cash');
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
    margin-bottom: 20px;
}

.select-payment {
    display: flex;
    justify-content: space-between;
    width: 100%;
    max-width: 300px;
    gap: 10px;
    margin-bottom: 20px;
}

.sod,
.pon {
    flex: 1;
    text-align: center;
    font-size: 20px;
    padding: 12px 0;
    border-radius: 30px;
    cursor: pointer;
    transition: 0.3s ease;
    border: 1px solid #000;
    border: none;
}

.sod {
    background: #FFFFFF;
    color: #000000;
}

.pon {
    background: #FFFFFF;
    color: #000000;
}

.sod.active {
    background: #000000;
    color: #FFFFFF;
}

.pon.active {
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
</style>
