<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-4xl font-extrabold text-[#696969] my-4">ยืนยันรายการ</h2>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1">
            <h2 class="text-black">เรียนคุณ {{ customer?.firstName }} {{ customer?.lastName }}</h2>
            <carDetailsTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black"><u>เงื่อนไขการชำระ : {{ paymentPlan }}</u></h2>
            <cashTable v-if="paymentPlan === 'เงินสด'" :cashPlan="cashPlan" />
            <installmentTable v-else-if="paymentPlan === 'ผ่อนชำระ'" :installmentPlans="installmentPlans" />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black">อุปกรณ์ตกแต่ง</h2>
            <accessoriesTable />
        </div>
        <div class="flex flex-col w-full max-w-lg p-1 gap-1 mt-1">
            <h2 class="text-black">หมายเหตุ</h2>
            <noteField />
        </div>
        <buttonGroup :goBack="goBack" :goNext="goNext" />
    </div>

    <modalConfirm v-if="showModal" message="ยืนยันรายการ" confirmText="ยืนยัน" cancelText="กลับ" @confirm="confirm"
        @cancel="closeModal" />

</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import carDetailsTable from '~/components/user/carDetailsTable.vue';
import cashTable from '~/components/user/cashTable.vue';
import installmentTable from '~/components/user/installmentTable.vue';
import accessoriesTable from '~/components/user/accessoriesTable.vue';
import noteField from '~/components/user/noteField.vue';
import buttonGroup from '~/components/user/buttonGroup.vue';
import modalConfirm from '~/components/user/modalConfirm.vue';
import { useRouter } from 'vue-router';
import ModalConfirm from '~/components/user/modalConfirm.vue';

const router = useRouter();
const customer = ref('');
const paymentPlan = ref('');
const cashPlan = ref({});
const installmentPlans = ref([]);
const showModal = ref(false);
const staffId = ref(null);

onMounted(() => {
    const storedCashPlan = localStorage.getItem('cashPlan');
    const storedInstallmentPlans = localStorage.getItem('installmentPlans');
    const customerData = localStorage.getItem('customerDetails');

    if (storedCashPlan) {
        paymentPlan.value = 'เงินสด';
        cashPlan.value = JSON.parse(storedCashPlan);
    } else if (storedInstallmentPlans) {
        paymentPlan.value = 'ผ่อนชำระ';
        installmentPlans.value = JSON.parse(storedInstallmentPlans);
    }

    if (customerData) {
        try {
            customer.value = JSON.parse(customerData);
        } catch (error) {
            console.error('Error parsing customerDetails:', error);
        }
    }
})

const goBack = () => {
    router.push('/customer-details');
};

const goNext = () => {
    showModal.value = true;
};

onMounted(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
        try {
            const decodedToken = atob(token.split(".")[1]);
            const parsedToken = JSON.parse(decodedToken);
            staffId.value = parsedToken.id;
        } catch (error) {
            console.error("Invalid token", error);
        }
    }
});

const confirm = async () => {
    showModal.value = false;

    const selectedCar = JSON.parse(localStorage.getItem('selectedCar') || '{}');
    const storedCashPlan = localStorage.getItem('cashPlan');
    const storedInstallmentPlans = localStorage.getItem('installmentPlans');
    const selectedAccessories = JSON.parse(localStorage.getItem('selectedAccessories') || '[]');
    const additionCost = JSON.parse(localStorage.getItem('additionCost') || '{}');
    const customerDetails = JSON.parse(localStorage.getItem('customerDetails') || '{}');


    const dataToSend = {
        customer: customerDetails,
        paymentMethod: storedCashPlan ? 'cash' : (storedInstallmentPlans ? 'installment' : null),
        additionCosts: {
            cmi: additionCost.cmiCheck ? true : false,
            insurance: additionCost.insuranceCheck ? true : false,
            fuelValue: additionCost.fuelValue || null,
            note: additionCost.note || null
        },
        carDetails: {
            unitType: selectedCar.unitType,
            modelClass: selectedCar.modelClass,
            modelCodeName: selectedCar.modelCodeName,
            modelGName: selectedCar.modelGName,
            price: selectedCar.price,
            color: selectedCar.color
        },
        accessories: selectedAccessories.map((item) => ({ assType: item.assType, assName: item.assName, price: item.price })),
        staffId: staffId.value
    }

    if (storedCashPlan) {
        dataToSend.paymentMethod = 'cash';
        dataToSend.cashPlans = JSON.parse(storedCashPlan);
    } else if (storedInstallmentPlans) {
        dataToSend.paymentMethod = 'installment';
        dataToSend.installmentPlans = JSON.parse(storedInstallmentPlans);
    }

    axios.post('http://localhost:3001/quotation/create', dataToSend)
        .then(response => {
            const quotationId = response.data.quotationId;
            showModal.value = false;
            router.push(`/quotation-success/${quotationId}`);
        })
        .catch(error => {
            console.error('Error creating quotation:', error);
            showModal.value = false;
        }
        );
}

const closeModal = () => {
    showModal.value = false;
};



definePageMeta({
    middleware: 'staff-auth'
});
</script>