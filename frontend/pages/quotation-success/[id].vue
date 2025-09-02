<template>
    <div class="flex flex-col items-center h-full p-2">
        <h2 class="text-3xl font-extrabold text-[#696969] my-4 text-center">ใบเสนอราคาที่สร้างสำเร็จ</h2>
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
            <button @click="openInNewTab"
                class="py-3 px-4 text-black bg-white rounded-lg border hover:bg-gray-100 flex items-center justify-center gap-2">
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
            <button @click="goHome" class="py-3 px-4 text-[#696969] bg-gray-200 rounded-lg border hover:bg-gray-300">
                กลับหน้าหลัก
            </button>
        </div>
    </div>
</template>


<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useApi } from '~/composables/useApi'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useQuotationStore } from '~/stores/quotation'

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
    // Load basic data for naming
    const meta = await api.get(`/quotation/${quotationId}`);
    quotationData.value = meta.data || {};
    // Load the actual PDF to display
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
    if (pdfUrl.value) {
        URL.revokeObjectURL(pdfUrl.value);
    }
});

const docNo = computed(() => {
    try {
        return String(quotationId).padStart(8, '0');
    } catch { return 'XXXXXXXX'; }
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
    // Prefer the already-fetched Blob URL (fast, no re-download)
    if (pdfUrl.value) {
        window.open(pdfUrl.value, '_blank', 'noopener,noreferrer');
        return;
    }
    // Fallback: open the backend PDF endpoint directly
    const directUrl = api.defaults.baseURL + `/quotation/${quotationId}/pdf`;
    window.open(directUrl, '_blank', 'noopener,noreferrer');
};



const goHome = () => {
    const store = useQuotationStore()
    store.clearAll()
    router.push('/home')
}
</script>