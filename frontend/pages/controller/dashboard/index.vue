<template>
    <div class="h-full bg-[#ececec] text-black p-4 md:p-5">
        <!-- Header -->
        <div class="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 bg-[#ececec] pb-3">
            <h1 class="text-2xl md:text-3xl font-semibold">แดชบอร์ด</h1>
            <div class="mt-3"></div>
        </div>

        <!-- KPI cards -->
        <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 rounded border border-gray-100">
                    <div class="text-sm text-gray-500">ใบเสนอราคาทั้งหมด</div>
                    <div class="text-2xl font-bold">{{ summary.totalQuotations }}</div>
                </div>
                <div class="p-4 rounded border border-gray-100">
                    <div class="text-sm text-gray-500">จำนวนลูกค้า</div>
                    <div class="text-2xl font-bold">{{ summary.totalCustomers }}</div>
                </div>
                <div class="p-4 rounded border border-gray-100">
                    <div class="text-sm text-gray-500">เดือนนี้</div>
                    <div class="text-2xl font-bold">{{ summary.monthlyQuotations }}</div>
                </div>
            </div>
        </div>

        <!-- Chart (moved above recent) -->
        <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm mt-4">
            <div class="flex items-center justify-between mb-3 gap-3">
                <h2 class="font-semibold">ใบเสนอราคา</h2>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">ระยะเวลา</label>
                    <select v-model.number="months" @change="onMonthsChange" class="border rounded px-2 py-1 text-sm">
                        <option :value="3">3 เดือน</option>
                        <option :value="6">6 เดือน</option>
                        <option :value="12">12 เดือน</option>
                    </select>
                    <button @click="fetchChart" class="px-3 py-1 bg-gray-100 rounded text-sm">รีเฟรช</button>
                </div>
            </div>

            <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-gray-500">ย้อนหลัง {{ months }} เดือน</div>
                <div class="text-sm">
                    <span class="text-gray-500 mr-2">แนวโน้ม</span>
                    <span :class="trend >= 0 ? 'text-emerald-600' : 'text-rose-600'" class="font-semibold">{{ trendLabel
                        }}</span>
                </div>
            </div>

            <div v-if="chartLoading" class="h-40 flex items-center justify-center text-gray-500">Loading chart…</div>
            <div v-else class="w-full h-48">
                <svg viewBox="0 0 600 240" class="w-full h-full">
                    <defs>
                        <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.95" />
                            <stop offset="100%" stop-color="#f97316" stop-opacity="0.9" />
                        </linearGradient>
                    </defs>
                    <!-- grid lines -->
                    <g v-for="i in 5" :key="i">
                        <line :x1="40" :x2="560" :y1="20 + (i - 1) * 40" :y2="20 + (i - 1) * 40" stroke="#eee" />
                    </g>
                    <!-- bars -->
                    <g transform="translate(40,20)">
                        <template v-for="(m, idx) in chartData" :key="m.month">
                            <rect :x="idx * (barW + gap)" :y="chartHeight - barHeight(m.count)" :width="barW"
                                :height="barHeight(m.count)" fill="url(#barGrad)" rx="6"
                                class="transition-all duration-500 ease-out hover:opacity-90" />
                            <text :x="idx * (barW + gap) + barW / 2" :y="chartHeight + 16" font-size="12"
                                text-anchor="middle" fill="#666">{{ m.monthLabel }}</text>
                            <text v-if="m.count > 0" :x="idx * (barW + gap) + barW / 2"
                                :y="chartHeight - barHeight(m.count) - 6" font-size="12" text-anchor="middle"
                                fill="#111">{{ m.count }}</text>
                        </template>
                    </g>
                </svg>
            </div>
        </div>

        <!-- Small stats row: Top models / Top staff / Payment distribution -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <h3 class="font-semibold mb-2">โมเดลยอดนิยม</h3>
                <ul class="text-sm space-y-2">
                    <li v-for="m in topModels" :key="m.model" class="flex justify-between">
                        <span>{{ m.model }}</span>
                        <span class="font-semibold">{{ m.count }}</span>
                    </li>
                </ul>
            </div>

            <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <h3 class="font-semibold mb-2">พนักงานยอดนิยม</h3>
                <ul class="text-sm space-y-2">
                    <li v-for="s in topStaff" :key="s.staffId" class="flex justify-between">
                        <span>{{ s.name }}</span>
                        <span class="font-semibold">{{ s.count }}</span>
                    </li>
                </ul>
            </div>

            <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm">
                <h3 class="font-semibold mb-2">การชำระเงิน</h3>
                <div class="flex flex-col gap-2">
                    <div v-for="p in payments" :key="p.method" class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-3 h-3 rounded-full"
                                :style="{ background: p.method === 'INSTALLMENT' ? '#ef4444' : '#f97316' }"></span>
                            <span class="text-sm capitalize">{{ p.method.toLowerCase() }}</span>
                        </div>
                        <div class="font-semibold">{{ p.count }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

definePageMeta({
    layout: 'admin',
    middleware: 'admin-auth',
});

const summary = ref({ totalQuotations: 0, totalCustomers: 0, monthlyQuotations: 0, recent: [] });
const loading = ref(false);
const chartData = ref([])
const chartLoading = ref(false)
const chartHeight = 140
const barW = 60
const gap = 18
const months = ref(6)
import { computed } from 'vue'

const trend = computed(() => {
    if (!chartData.value || chartData.value.length < 2) return 0
    const len = chartData.value.length
    const last = chartData.value[len - 1].count || 0
    const prev = chartData.value[len - 2]?.count || 0
    if (prev === 0) return last === 0 ? 0 : 100
    return Math.round(((last - prev) / prev) * 100)
})

const trendLabel = computed(() => {
    const t = trend.value
    if (t > 0) return `+${t}%`;
    return `${t}%`
})
import { useApi } from '~/composables/useApi'
const api = useApi();

const topModels = ref([])
const topStaff = ref([])
const payments = ref([])

const fetchExtras = async () => {
    try {
        const [mRes, sRes, pRes] = await Promise.all([
            api.get(`/quotation/stats/top-models`),
            api.get(`/quotation/stats/top-staff`),
            api.get(`/quotation/stats/payment-distribution`),
        ])
        topModels.value = mRes.data
        topStaff.value = sRes.data
        payments.value = pRes.data
    } catch (e) {
        console.error('Failed to load extras', e)
    }
}

const fetchSummary = async () => {
    loading.value = true;
    try {
        const resp = await api.get(`/quotation/summary`);
        summary.value = resp.data;
    } catch (e) {
        console.error('Failed to load summary', e);
    } finally {
        loading.value = false;
    }
};

const fetchChart = async () => {
    chartLoading.value = true
    try {
        const res = await api.get(`/quotation/stats/monthly`, { params: { months: months.value } })
        chartData.value = res.data
    } catch (e) {
        console.error('Failed to load chart', e)
        chartData.value = []
    } finally {
        chartLoading.value = false
    }
}

function onMonthsChange() {
    fetchChart()
}

onMounted(() => {
    fetchSummary();
    fetchChart();
    fetchExtras();
});

function barHeight(count) {
    const max = Math.max(1, ...chartData.value.map((c) => c.count))
    if (!max) return 0
    const scale = chartHeight / max
    return Math.round(count * scale)
}
</script>
