<template>
    <div class="h-full text-black p-4 md:p-5">
        <div class="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 pb-3">
            <h1 class="text-2xl md:text-3xl font-semibold">บันทึกการตรวจสอบ</h1>
        </div>

        <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <select v-model="entity" @change="onFilterChange" class="border rounded px-2 py-1 text-sm">
                        <option value="">All entities</option>
                        <option value="quotation">Quotation</option>
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                    </select>
                    <select v-model="level" @change="onFilterChange" class="border rounded px-2 py-1 text-sm">
                        <option value="">All levels</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                        <option value="FATAL">FATAL</option>
                    </select>
                    <!-- Date picker -->
                    <flat-pickr v-model="dateRange" @on-change="onFilterChange"
                        :config="{ dateFormat: 'Y-m-d', allowInput: true }"
                        class="border rounded px-2 py-1 text-sm w-36 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                        placeholder="Select date" />
                    <button @click="clearFilters"
                        class="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm border border-gray-400 hover:bg-gray-200">Clear
                        Filters</button>
                </div>
                <div class="flex items-center gap-2">

                    <button @click="exportCsv" class="px-3 py-1 bg-gray-800 text-white rounded text-sm">Export
                        CSV</button>
                </div>
            </div>

            <div>
                <div v-if="loading" class="py-6 text-center text-gray-500">Loading…</div>
                <div v-else>
                    <div class="overflow-x-auto">
                        <div
                            class="bg-neutral-50 rounded-lg p-2 text-xs font-mono whitespace-pre overflow-x-auto border border-neutral-200 shadow-sm">
                            <template v-if="logs.length > 0">
                                <div v-for="r in logs" :key="r.id"
                                    class="flex items-center py-1 border-b border-gray-800">
                                    <span :class="['px-2 py-0.5 rounded font-bold flex-shrink-0 text-center',
                                        r.level === 'INFO' ? 'bg-blue-700 text-blue-100' :
                                            r.level === 'WARN' ? 'bg-yellow-700 text-yellow-100' :
                                                r.level === 'ERROR' ? 'bg-red-700 text-red-100' :
                                                    r.level === 'FATAL' ? 'bg-black text-red-400 border border-red-400' :
                                                        'bg-gray-700 text-gray-200']"
                                        style="min-width: 60px; max-width: 60px; display: inline-block;">
                                        {{ r.level }}
                                    </span>
                                    <span class="text-green-700 font-semibold text-center flex-shrink-0"
                                        style="min-width: 170px; max-width: 170px; display: inline-block;">
                                        [{{ new Date(r.createdAt).toLocaleString() }}]
                                    </span>
                                    <span class="text-blue-900 font-semibold text-center flex-shrink-0"
                                        style="min-width: 80px; max-width: 80px; display: inline-block;">
                                        {{ r.entity }}
                                    </span>
                                    <span class="text-yellow-800 font-semibold text-center flex-shrink-0"
                                        style="min-width: 60px; max-width: 60px; display: inline-block;">
                                        #{{ r.entityId }}
                                    </span>
                                    <span class="text-pink-700 font-semibold text-center flex-shrink-0"
                                        style="min-width: 90px; max-width: 90px; display: inline-block;">
                                        {{ r.action }}
                                    </span>
                                    <span class="text-gray-800 font-semibold text-center flex-shrink-0"
                                        style="min-width: 90px; max-width: 90px; display: inline-block;">
                                        by {{ r.performedBy ?? 'system' }}
                                    </span>
                                    <span class="text-gray-900 font-bold flex-1 pl-2 pr-2 truncate"
                                        style="min-width: 120px;">
                                        {{ r.message || actionSummary(r) }}
                                    </span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="text-center text-gray-400 py-6">No data</div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination :page="page" :total-pages="totalPages" :show-page-size="false" :page-size="limit"
                @update:page="onPaginationPage" />
        </div>
    </div>
</template>

<script setup>
import Pagination from '~/components/common/Pagination.vue'

function getResponsiveLimit() {
    if (typeof window === 'undefined') return 10;
    const w = window.innerWidth;
    if (w < 640) return 8;
    if (w < 1024) return 15;
    return 25;
}

function updateResponsiveLimit() {
    limit.value = getResponsiveLimit();
}

onMounted(() => {
    updateResponsiveLimit();
    window.addEventListener('resize', updateResponsiveLimit);
});
onUnmounted(() => {
    window.removeEventListener('resize', updateResponsiveLimit);
});
function clearFilters() {
    entity.value = '';
    level.value = '';
    dateRange.value = '';
    page.value = 1;
    fetchLogs();
}
import FlatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
function onFilterChange() {
    page.value = 1;
    fetchLogs();
}
import { onUnmounted } from 'vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

definePageMeta({
    layout: 'admin',
    middleware: 'admin-auth',
})

const entity = ref('')
const dateRange = ref('')
const logs = ref([])
const level = ref('')
const loading = ref(false)
const page = ref(1)
const limit = ref(getResponsiveLimit())
const totalPages = ref(1)
const totalItems = ref(0)


const config = useRuntimeConfig()
const api = useApi()
const router = useRouter()

const fetchLogs = async () => {
    loading.value = true
    try {
        const params = { page: page.value, limit: limit.value }
        if (entity.value) params.entity = entity.value
        if (dateRange.value) {
            const d = typeof dateRange.value === 'string' ? new Date(dateRange.value) : dateRange.value
            params.startDate = new Date(d.setHours(0, 0, 0, 0)).toISOString()
            params.endDate = new Date(d.setHours(23, 59, 59, 999)).toISOString()
        }
        if (level.value) params.level = level.value
        const res = await api.get('/audit', { params })
        logs.value = res.data.data || []
        totalPages.value = res.data.totalPages || 1
        totalItems.value = res.data.total || 0
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}


let socket = null
onMounted(() => {
    fetchLogs()
    if (typeof window !== 'undefined') {
        import('socket.io-client').then(({ io }) => {
            const wsUrl = (config.public?.backendUrl || '').replace(/^http/, 'ws') || window.location.origin.replace(/^http/, 'ws')
            socket = io(wsUrl + '/logs', { transports: ['websocket'] })
            socket.on('connect', () => { /* connected */ })
            socket.on('log', (log) => {
                if (
                    (!entity.value || log.entity === entity.value) &&
                    (!level.value || log.level === level.value)
                ) {
                    logs.value.unshift(log)
                    if (logs.value.length > limit.value) logs.value.pop()
                    totalItems.value++
                }
            })
        })
    }
})

onUnmounted(() => { if (socket) { socket.disconnect(); socket = null } })
const exportCsv = async () => {
    try {
        const params = { entity: entity.value }
        if (dateRange.value) {
            const d = new Date(dateRange.value)
            params.startDate = new Date(d.setHours(0, 0, 0, 0)).toISOString()
            params.endDate = new Date(d.setHours(23, 59, 59, 999)).toISOString()
        }
        const res = await api.get('/audit/export', { params, responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `audit-${new Date().toISOString()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
    } catch (e) { console.error('Export failed', e) }
}


function onPaginationPage(newPage) {
    page.value = newPage;
    fetchLogs();
}

onMounted(fetchLogs)

function createdFrom(r) {
    try {
        if (!r || !r.metadata) return null
        const m = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
        if (!m) return null
        if (m.createdFrom) return String(m.createdFrom)
        if (m.createdFromId) return String(m.createdFromId)
        if (m.sourceQuotationId) return String(m.sourceQuotationId)
        if (m.source_quotation_id) return String(m.source_quotation_id)
        if (m.from && (m.from.id || m.fromId)) return String(m.from.id || m.fromId)
        if (m.source && m.source.id) return String(m.source.id)
        return null
    } catch (e) { return null }
}

function actionSummary(r) {
    try {
        if (!r) return ''
        const a = r.action || ''
        const m = !r.metadata ? {} : (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata)
        if (a === 'create_from' && (m.createdFrom || m.from || m.source || m.sourceQuotationId || m.source_quotation_id)) {
            const cf = createdFrom(r)
            return cf ? `(from #${cf})` : '(from ?)'
        }
        if (a === 'update' && m.changes) {
            const fields = Object.keys(m.changes || {}).slice(0, 3)
            if (fields.length) return `(changed ${fields.join(',')})`
        }
        if (a === 'delete') return '(deleted)'
        if (a === 'create') return '(created)'
        return ''
    } catch (e) { return '' }
}
</script>
