<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-3xl font-extrabold text-[#696969] my-4 text-center">ประวัติการทำรายการ</h2>
        <div ref="modalContent" id="quotation-content"
            class="flex flex-col w-full max-w-2xl p-4 gap-2 border border-black bg-white rounded-md">
            <div class="flex flex-col items-center justify-center w-full max-w-2xl text-center">
                <img src="/assets/isuzu-quotation-logo.png" alt="ISUZU Logo" class="w-40 h-auto" />
            </div>

            <div class="text-sm text-black leading-relaxed text-center">
                <div>บริษัท อีซูซุเชียงราย จำกัด</div>
                <div>145/1 ม.17 ถ.ซุปเปอร์ไฮเวย์ ต.รอบเวียง อ.เมือง จ.เชียงราย 57000 โทร.053-711605</div>
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
                บริษัท อีซูซุเชียงราย จำกัด
                ขอขอบคุณท่านเป็นอย่างยิ่งที่ได้ให้ความสนใจในผลิตภัณฑ์ของทางบริษัทและหวังเป็นอย่างยิ่งว่าท่านจะได้รับการตอบรับที่ดีจากท่าน
            </p>

            <div class="flex justify-end w-full mt-4">
                <div class="text-center text-black text-sm flex flex-col items-center">
                    <div>ผู้เสนอราคา</div>
                    <div>{{ quotationData?.staff?.firstName }} {{ quotationData?.staff?.lastName }}</div>
                    <div>(ที่ปรึกษาการขาย)</div>
                    <div>Tel: {{ quotationData?.staff?.phoneNumber }}</div>
                </div>
            </div>
        </div>


        <div class="flex w-full max-w-lg mt-4 justify-center gap-2">
            <button @click="exportToImage"
                class="w-2/4  py-3 px-4 text-black rounded-lg text-l font-semibold flex items-center gap-2 border border-black hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19 13V18C19 18.55 18.55 19 18 19H6C5.45 19 5 18.55 5 18V13C5 12.45 4.55 12 4 12C3.45 12 3 12.45 3 13V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13ZM13 12.67L14.88 10.79C14.9726 10.6974 15.0825 10.624 15.2035 10.5739C15.3244 10.5238 15.4541 10.498 15.585 10.498C15.7159 10.498 15.8456 10.5238 15.9665 10.5739C16.0875 10.624 16.1974 10.6974 16.29 10.79C16.3826 10.8826 16.456 10.9925 16.5061 11.1135C16.5562 11.2344 16.582 11.3641 16.582 11.495C16.582 11.6259 16.5562 11.7556 16.5061 11.8765C16.456 11.9975 16.3826 12.1074 16.29 12.2L12.7 15.79C12.6075 15.8827 12.4976 15.9563 12.3766 16.0064C12.2557 16.0566 12.126 16.0824 11.995 16.0824C11.864 16.0824 11.7343 16.0566 11.6134 16.0064C11.4924 15.9563 11.3825 15.8827 11.29 15.79L7.7 12.2C7.51302 12.013 7.40798 11.7594 7.40798 11.495C7.40798 11.2306 7.51302 10.977 7.7 10.79C7.88698 10.603 8.14057 10.498 8.405 10.498C8.66943 10.498 8.92302 10.603 9.11 10.79L11 12.67V4C11 3.45 11.45 3 12 3C12.55 3 13 3.45 13 4V12.67Z"
                        fill="black" />
                </svg>
                บันทึกเป็นรูปภาพ
            </button>
            <button @click="goModify"
                class="w-2/4  py-3 px-4 text-black rounded-lg text-l font-semibold flex items-center gap-2 border border-black hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V12"
                        stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path
                        d="M18.375 2.625C18.7728 2.22717 19.3124 2.00368 19.875 2.00368C20.4376 2.00368 20.9771 2.22717 21.375 2.625C21.7728 3.02282 21.9963 3.56239 21.9963 4.125C21.9963 4.68761 21.7728 5.22717 21.375 5.625L12.362 14.639C12.1245 14.8762 11.8312 15.0499 11.509 15.144L8.63597 15.984C8.54992 16.0091 8.45871 16.0106 8.37188 15.9884C8.28505 15.9661 8.2058 15.9209 8.14242 15.8576C8.07904 15.7942 8.03386 15.7149 8.01162 15.6281C7.98937 15.5413 7.99087 15.45 8.01597 15.364L8.85597 12.491C8.9505 12.169 9.12451 11.8761 9.36197 11.639L18.375 2.625Z"
                        stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                แก้ไข
            </button>
        </div>

        <div class="flex flex-col space-y-4 w-full max-w-md mt-6">
            <button @click="goBack" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
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

const goBack = () => {
    router.push('/history');
};

const goModify = () => {
    router.push(`/modify/${quotationId}`);
};


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

    #quotation-content {
      width: 512px;
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


</script>