<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-3xl font-extrabold text-[#696969] my-4 text-center">รายละเอียดใบเสนอราคา</h2>
        <div class="w-full max-w-3xl mt-2">
            <div v-if="pdfLoading" class="flex items-center justify-center h-[70vh] border rounded">
                <div class="flex items-center gap-2 text-gray-600">
                    <svg class="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>กำลังโหลดเอกสาร PDF…</span>
                </div>
            </div>
            <div v-else-if="pdfUrl" class="w-full">
                <iframe :src="pdfUrl" class="w-full border" style="height: 75vh"></iframe>
            </div>
        </div>

        <div class="flex flex-col space-y-3 w-full max-w-md mt-4">
            <button @click="saveAsPdf"
                class="py-3 px-4 text-black bg-white rounded-lg border hover:bg-gray-100 flex items-center justify-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8.82843C20 8.29799 19.7893 7.78929 19.4142 7.41421L14.5858 2.58579C14.2107 2.21071 13.702 2 13.1716 2H6ZM13 3.41421L18.5858 9H14C13.4477 9 13 8.55228 13 8V3.41421Z"
                        fill="black" />
                </svg>
                ดาวน์โหลด PDF
            </button>
            <div class="flex w-full gap-2">
                <button @click="openInNewTab"
                    class="py-3 px-4 text-black bg-white rounded-lg border hover:bg-gray-100 flex items-center justify-center gap-2 w-1/2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 3H21V10" stroke="black" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M10 14L21 3" stroke="black" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <path d="M21 14V21H3V3H10" stroke="black" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                    แท็บใหม่
                </button>
                <button @click="goModify"
                    class="py-3 px-4 text-black bg-white rounded-lg border hover:bg-gray-100 flex items-center justify-center gap-2 w-1/2">
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
            <button @click="goBack" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                กลับ
            </button>
        </div>
    </div>
</template>


<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const config = useRuntimeConfig()
const api = useApi();

const route = useRoute();
const quotationId = route.params.id;
const router = useRouter();
const quotationData = ref({});
const pdfUrl = ref('');
const pdfLoading = ref(false);

onMounted(async () => {
    try {
        pdfLoading.value = true;
        const meta = await api.get(`/quotation/${quotationId}`);
        quotationData.value = meta.data || {};
    const res = await api.get(`/quotation/${quotationId}/pdf`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        pdfUrl.value = URL.createObjectURL(blob);
    } catch (e) {
        console.error('Failed to load final PDF', e);
    } finally {
        pdfLoading.value = false;
    }
});

onBeforeUnmount(() => {
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
});

const docNo = computed(() => {
    try { return String(quotationId).padStart(8, '0'); } catch { return 'XXXXXXXX'; }
});

const pdfFileName = computed(() => {
    const firstName = quotationData.value?.customer?.firstName || '';
    return `NO. ${docNo.value} ${firstName}`.trim() + '.pdf';
});

const saveAsPdf = async () => {
    try {
        const res = await api.get(`/quotation/${quotationId}/pdf`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFileName.value;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to save PDF', e);
    }
};

const openInNewTab = () => {
    if (pdfUrl.value) {
        window.open(pdfUrl.value, '_blank', 'noopener,noreferrer');
        return;
    }
    const directUrl = `${api.defaults.baseURL.replace(/\/$/, '')}/quotation/${quotationId}/pdf`;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
};

const goBack = () => router.push('/history');
const goModify = () => router.push(`/modify/${quotationId}`);


</script>