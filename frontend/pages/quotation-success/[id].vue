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
        <div class="flex w-full max-w-lg mt-4 justify-center ">
            <button @click="exportToImage"
                class="w-2/4 py-3 px-4 text-black rounded-lg text-l font-semibold flex items-center justify-center gap-2 border border-black hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 13V18C19 18.55 18.55 19 18 19H6C5.45 19 5 18.55 5 18V13C5 12.45 4.55 12 4 12C3.45 12 3 12.45 3 13V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13ZM13 12.67L14.88 10.79C14.9726 10.6974 15.0825 10.624 15.2035 10.5739C15.3244 10.5238 15.4541 10.498 15.585 10.498C15.7159 10.498 15.8456 10.5238 15.9665 10.5739C16.0875 10.624 16.1974 10.6974 16.29 10.79C16.3826 10.8826 16.456 10.9925 16.5061 11.1135C16.5562 11.2344 16.582 11.3641 16.582 11.495C16.582 11.6259 16.5562 11.7556 16.5061 11.8765C16.456 11.9975 16.3826 12.1074 16.29 12.2L12.7 15.79C12.6075 15.8827 12.4976 15.9563 12.3766 16.0064C12.2557 16.0566 12.126 16.0824 11.995 16.0824C11.864 16.0824 11.7343 16.0566 11.6134 16.0064C11.4924 15.9563 11.3825 15.8827 11.29 15.79L7.7 12.2C7.51302 12.013 7.40798 11.7594 7.40798 11.495C7.40798 11.2306 7.51302 10.977 7.7 10.79C7.88698 10.603 8.14057 10.498 8.405 10.498C8.66943 10.498 8.92302 10.603 9.11 10.79L11 12.67V4C11 3.45 11.45 3 12 3C12.55 3 13 3.45 13 4V12.67Z"
                        fill="black" />
                </svg>
                บันทึกเป็นรูปภาพ
            </button>
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-md mt-3 mb-1">
            <button @click="goHome" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                กลับ
            </button>
        </div>
    </div>
</template>


<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref, computed } from 'vue';
import { toPng } from 'html-to-image';

import carDetailsTable from '~/components/user/carDetailsTable.vue';
import accessoriesTable from '~/components/user/accessoriesTable.vue';
import cashTable from '~/components/user/cashTable.vue';
import installmentTable from '~/components/user/installmentTable.vue';
import noteField from '~/components/user/noteField.vue';

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const paymentPlan = ref('');
const cashPlan = ref({});
const installmentPlans = ref([]);

axios
    .get(`${backendUrl}/quotation/${quotationId}`)
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
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500&display=swap');

    * {
      font-family: 'Noto Sans Thai', sans-serif !important;
      font-weight: 500 !important;
      font-style: normal !important;
    }
  `;
    clonedNode.prepend(fontStyle);

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.appendChild(clonedNode);
    document.body.appendChild(container);

    try {
        await document.fonts.ready;

        const dataUrl = await toPng(clonedNode, {
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor: '#ffffff',
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