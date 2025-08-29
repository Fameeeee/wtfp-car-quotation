<template>
  <div class="min-h-screen bg-[#F5F5F5] text-black">
    <!-- Sticky header -->
    <header class="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="goBack" class="h-9 px-3 rounded-md border text-sm hover:bg-gray-100">กลับ</button>
          <h1 class="text-2xl font-bold">History</h1>
        </div>
        <div class="flex gap-2">
          <button @click="goModify"
            class="h-9 px-3 rounded-md border text-sm font-semibold flex items-center gap-2 hover:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3H5C4.47 3 3.961 3.211 3.586 3.586C3.211 3.961 3 4.47 3 5V19C3 19.53 3.211 20.039 3.586 20.414C3.961 20.789 4.47 21 5 21H19C19.53 21 20.039 20.789 20.414 20.414C20.789 20.039 21 19.53 21 19V12" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.375 2.625C18.773 2.227 19.312 2.004 19.875 2.004C20.438 2.004 20.977 2.227 21.375 2.625C21.773 3.023 21.996 3.562 21.996 4.125C21.996 4.688 21.773 5.227 21.375 5.625L12.362 14.639C12.125 14.876 11.831 15.05 11.509 15.144L8.856 12.491C8.951 12.169 9.125 11.876 9.362 11.639L18.375 2.625Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            แก้ไข
          </button>
          <button @click="openInNewTab" :disabled="!pdfUrl"
            class="h-9 px-3 rounded-md border text-sm font-semibold flex items-center gap-2 hover:bg-gray-100 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 3H21V10" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 14L21 3" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 14V19C21 20.105 20.105 21 19 21H5C3.895 21 3 20.105 3 19V5C3 3.895 3.895 3 5 3H10" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            เปิดในแท็บใหม่
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-4">
      <!-- Info bar -->
      <div class="flex flex-wrap items-center gap-2 text-sm text-gray-700 mb-3">
        <div v-if="historyData?.customer" class="px-2 py-1 bg-white rounded border">ลูกค้า: {{ historyData.customer.firstName }} {{ historyData.customer.lastName }}</div>
        <div v-if="historyData?.staff" class="px-2 py-1 bg-white rounded border">พนักงาน: {{ historyData.staff.firstName }} {{ historyData.staff.lastName }}</div>
        <div v-if="historyData?.quotationDate" class="px-2 py-1 bg-white rounded border">วันที่: {{ formattedDate }}</div>
        <div v-if="paymentLabel" class="px-2 py-1 rounded border bg-emerald-50 text-emerald-700">{{ paymentLabel }}</div>
      </div>

      <!-- PDF viewer -->
      <div class="rounded-lg border bg-white overflow-hidden">
        <div v-if="loading" class="p-6">
          <div class="animate-pulse space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-[60vh] bg-gray-100 rounded"></div>
          </div>
        </div>
        <div v-else>
          <iframe v-if="pdfUrl" :src="pdfUrl" class="w-full h-[75vh] md:h-[82vh]"></iframe>
          <div v-else class="p-6 text-center text-gray-500">ไม่สามารถแสดง PDF ได้</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'

const config = useRuntimeConfig()
const backendUrl = config.public.backendUrl;
const route = useRoute()
const router = useRouter()
const quotationId = route.params.id

const historyData = ref(null)
const loading = ref(true)
const pdfUrl = ref('')
let objectUrl = ''

const fetchHistoryData = async () => {
  try {
    const response = await axios.get(`${backendUrl}/quotation/${quotationId}`)
    historyData.value = response.data
    await fetchPdf()
  } catch (error) {
    console.error('Error fetching history data:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/controller/history')
}

const goModify = () => {
  router.push(`/controller/history/modify/${quotationId}`)
}

const openInNewTab = () => {
  if (pdfUrl.value) window.open(pdfUrl.value, '_blank')
}

onMounted(() => {
  fetchHistoryData()
})

const formattedDate = computed(() => {
  if (!historyData?.value?.quotationDate) return '';
  const date = new Date(historyData?.value?.quotationDate);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const paymentLabel = computed(() => {
  const method = historyData.value?.paymentMethod
  if (!method) return ''
  return method === 'cash' ? 'ชำระเงินสด' : 'ผ่อนชำระ'
})

async function fetchPdf () {
  try {
    const res = await axios.get(`${backendUrl}/quotation/${quotationId}/pdf`, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrl = URL.createObjectURL(blob)
    pdfUrl.value = objectUrl
  } catch (e) {
    console.error('Error fetching PDF:', e)
    pdfUrl.value = ''
  }
}

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})


definePageMeta({
  middleware: 'admin-auth',
  layout: 'admin',
})
</script>
