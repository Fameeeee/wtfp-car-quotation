<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-3xl font-extrabold text-[#696969] my-4 text-center">สรุปยอดรายการ</h2>
        <div id="quotation-content"
            class="flex flex-col w-full max-w-lg p-4 gap-2 border border-black bg-white rounded-md">
            <div class="flex flex-col items-center justify-center w-full max-w-lg text-center">
                <img src="../../public/assets/isuzu-quotation-logo.png" alt="ISUZU Logo" class="w-40 h-auto " />
            </div>

            <div class="text-sm text-black leading-relaxed text-center">
                <div>บริษัท อีซูซุเชียงราย จำกัด</div>
                <div>
                    145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000
                    โทร.053-711605
                </div>
                <div class="text-sm text-black">{{ formattedDate }}</div>
            </div>

            <u class="text-black">เรื่อง ใบเสนอราคา</u>
            <u class="text-black">เรียน {{ quotationData?.customer?.firstName }} {{ quotationData?.customer?.lastName
                }}</u>

            <carDetailsTable />
            <h2 class="text-black"><u>เงื่อนไขการชำระ : {{ paymentPlan }}</u></h2>
            <cashTable v-if="paymentPlan === 'เงินสด'" :cashPlan="cashPlan" />
            <installmentTable v-else-if="paymentPlan === 'ผ่อนชำระ'" :installmentPlans="installmentPlans" />

            <div class="text-black font-semibold">อุปกรณ์ตกแต่ง</div>
            <accessoriesTable />

            <div class="text-black font-semibold">หมายเหตุ</div>
            <noteField />

            <p class="text-black text-sm indent-8">
                บริษัท อีซูซุเชียงราย จำกัด ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้
                ความสนใจในผลิตภัณฑ์ของทางบริษัทและหวังเป็นอย่างยิ่งว่าท่านจะได้รับ
                การตอบรับที่ดีจากท่าน
            </p>

            <div class="flex justify-end w-full mt-4">
                <div class="text-center text-black text-sm flex flex-col items-center">
                    <div class="whitespace-nowrap">ผู้เสนอราคา</div>
                    <div class="whitespace-nowrap">{{ quotationData?.staff?.firstName }} {{
                        quotationData?.staff?.lastName }}</div>
                    <div class="whitespace-nowrap">(ที่ปรึกษาการขาย)</div>
                    <div class="whitespace-nowrap">Tel: {{ quotationData?.staff?.phoneNumber }}</div>
                </div>
            </div>

        </div>
        <div>
            <button @click="exportToImage" class="py-3 px-4 text-black rounded-lg">
                บันทึกเป็นรูปภาพ
            </button>
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goHome" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                กลับ
            </button>
        </div>
    </div>
</template>


<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref } from 'vue';
import { toPng } from 'html-to-image';

import carDetailsTable from '~/components/user/carDetailsTable.vue';
import accessoriesTable from '~/components/user/accessoriesTable.vue';
import cashTable from '~/components/user/cashTable.vue';
import installmentTable from '~/components/user/installmentTable.vue';
import noteField from '~/components/user/noteField.vue';

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const paymentPlan = ref('');
const cashPlan = ref({});
const installmentPlans = ref([]);

axios
    .get(`http://localhost:3001/quotation/${quotationId}`)
    .then((response) => {
        quotationData.value = response.data;
        if (response.data.cashPlans) {
            cashPlan.value = response.data.cashPlans;
            paymentPlan.value = 'เงินสด';
        } else if (response.data.installmentPlans) {
            installmentPlans.value = response.data.installmentPlans;
            paymentPlan.value = 'ผ่อนชำระ';
        } else {
            console.error('No payment plan found in the response data.');
        }
    })
    .catch((error) => {
        console.error('Error fetching quotation data:', error);
    });

const formattedDate = computed(() => {
    if (!quotationData.value.quotationDate) return '';
    const date = new Date(quotationData.value.quotationDate);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const exportToImage = async () => {
    const node = document.getElementById('quotation-content');
    if (!node) return;


    const clonedNode = node.cloneNode(true);

    const fontStyle = document.createElement('style');
    fontStyle.innerHTML = `
    body {
      font-family: 'Noto Sans Thai', sans-serif !important;
      font-weight: 500;
      font-style: normal;
    }
  `;
    clonedNode.prepend(fontStyle);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.appendChild(clonedNode);
    document.body.appendChild(container);

    try {
        const dataUrl = await toPng(clonedNode, {
            pixelRatio: 2,
            cacheBust: true
        });

        const link = document.createElement('a');
        link.download = 'quotation.png';
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        document.body.removeChild(container);
    }
};

const goHome = () => {
    localStorage.removeItem('selectedCar');
    localStorage.removeItem('cashPlan');
    localStorage.removeItem('installmentPlans');
    localStorage.removeItem('selectedAccessories');
    localStorage.removeItem('additionCost');
    localStorage.removeItem('customerDetails');
    router.push('/home');
};
</script>