<template>
    <div class="h-full bg-[#ececec] text-black p-4 md:p-5">
        <div class="sticky top-0 z-10 -mx-4 md:mx-0 px-4 md:px-0 bg-[#ececec] pb-3">
            <h1 class="text-2xl md:text-3xl font-semibold">บันทึกการตรวจสอบ</h1>
        </div>

        <div class="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <select v-model="entity" class="border rounded px-2 py-1 text-sm">
                        <option value="">All entities</option>
                        <option value="quotation">Quotation</option>
                        <option value="customer">Customer</option>
                    </select>
                    <select v-model="action" class="border rounded px-2 py-1 text-sm">
                        <option value="">All actions</option>
                        <option value="create">create</option>
                        <option value="update">update</option>
                        <option value="delete">delete</option>
                        <option value="create_from">create_from</option>
                    </select>
                    <input v-model="performedBy" placeholder="performedBy (staff id)"
                        class="border rounded px-2 py-1 text-sm w-44" />
                    <input v-model="startDate" type="date" class="border rounded px-2 py-1 text-sm" />
                    <input v-model="endDate" type="date" class="border rounded px-2 py-1 text-sm" />
                    <button @click="fetchLogs" class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Filter</button>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="exportCsv" class="px-3 py-1 bg-gray-800 text-white rounded text-sm">Export
                        CSV</button>
                    <button @click="exportPage" class="px-3 py-1 bg-green-600 text-white rounded text-sm">Export
                        page</button>
                </div>
            </div>

            <div>
                <div v-if="loading" class="py-6 text-center text-gray-500">Loading…</div>
                <div v-else>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm table-auto">
                            <thead>
                                <tr class="text-left text-xs text-gray-500 border-b">
                                    <th class="py-2 px-2">#</th>
                                    <th class="py-2 px-2">Action</th>
                                    <th class="py-2 px-2">Entity</th>
                                    <th class="py-2 px-2">Created From</th>
                                    <th class="py-2 px-2">Entity ID</th>
                                    <th class="py-2 px-2">By</th>
                                    <th class="py-2 px-2">When</th>
                                    <th class="py-2 px-2">Meta</th>
                                    <th class="py-2 px-2"> </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="r in logs" :key="r.id" class="border-b">
                                    <td class="py-2 px-2 text-xs text-gray-600">{{ r.id }}</td>
                                    <td class="py-2 px-2 font-medium">{{ r.action }} <span
                                            class="text-xs text-gray-400">{{ actionSummary(r) }}</span></td>
                                    <td class="py-2 px-2">{{ r.entity }}</td>
                                    <td class="py-2 px-2">
                                        <span v-if="createdFrom(r)">
                                            <a @click.prevent="goToQuotation(createdFrom(r))"
                                                class="text-blue-600 hover:underline cursor-pointer">#{{ createdFrom(r)
                                                }}</a>
                                        </span>
                                        <span v-else>—</span>
                                    </td>
                                    <td class="py-2 px-2">{{ r.entityId }}</td>
                                    <td class="py-2 px-2">{{ r.performedBy ?? 'system' }}</td>
                                    <td class="py-2 px-2">{{ new Date(r.createdAt).toLocaleString() }}</td>
                                    <td class="py-2 px-2 text-xs text-gray-600 truncate max-w-[240px]">{{
                                        shortMeta(r.metadata) }}</td>
                                    <td class="py-2 px-2">
                                        <button @click="openDetails(r)"
                                            class="px-2 py-1 text-xs border rounded">Details</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-3 flex flex-col md:flex-row items-center justify-between gap-3">
                <div class="text-sm text-gray-600">Showing {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit,
                    totalItems) }} of {{ totalItems }}</div>
                <div class="flex items-center gap-2">
                    <button @click="firstPage" :disabled="page <= 1"
                        class="px-2 py-1 border rounded disabled:opacity-50">First</button>
                    <button @click="prevPage" :disabled="page <= 1"
                        class="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
                    <div class="px-2">Page</div>
                    <input type="number" min="1" :max="totalPages" v-model.number="page"
                        @keyup.enter="() => goToPage(page)" class="w-16 text-sm border rounded px-2 py-1" />
                    <div class="px-2">of {{ totalPages }}</div>
                    <button @click="nextPage" :disabled="page >= totalPages"
                        class="px-2 py-1 border rounded disabled:opacity-50">Next</button>
                    <button @click="lastPage" :disabled="page >= totalPages"
                        class="px-2 py-1 border rounded disabled:opacity-50">Last</button>
                    <select v-model.number="limit" @change="() => { page.value = 1; fetchLogs() }"
                        class="border rounded px-2 py-1 text-sm">
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Details modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40" @click="closeDetails"></div>
            <div class="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-4">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-semibold">Audit Details</h3>
                    <button @click="closeDetails" class="text-sm text-gray-500">Close</button>
                </div>
                <div class="text-sm text-gray-700">
                    <div class="mb-2"><strong>Action:</strong> {{ selected?.action }}</div>
                    <div class="mb-2"><strong>Entity:</strong> {{ selected?.entity }} #{{ selected?.entityId }}</div>
                    <div class="mb-2"><strong>Created From:</strong>
                        <span v-if="selectedChain.length">
                            <template v-for="(id, idx) in selectedChain">
                                <a @click.prevent="goToQuotation(id)" class="text-blue-600 hover:underline cursor-pointer mr-2">#{{ id }}</a>
                                <span v-if="idx < selectedChain.length - 1" class="text-gray-400">→</span>
                            </template>
                        </span>
                        <span v-else>—</span>
                    </div>
                    <div class="mb-2"><strong>By:</strong> {{ selected?.performedBy ?? 'system' }}</div>
                    <div class="mb-2"><strong>When:</strong> {{ selected ? new Date(selected.createdAt).toLocaleString()
                        : '' }}</div>
                    <div class="mt-3">
                        <div class="text-xs text-gray-500 mb-1">Metadata</div>
                        <pre
                            class="text-xs bg-gray-50 p-2 rounded max-h-60 overflow-auto">{{ prettyMeta(selected?.metadata) }}</pre>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'

definePageMeta({
    layout: 'admin',
    middleware: 'admin-auth',
})

const entity = ref('quotation')
const action = ref('')
const performedBy = ref('')
const startDate = ref('')
const endDate = ref('')
const logs = ref([])
const loading = ref(false)
const page = ref(1)
const limit = ref(25)
const totalPages = ref(1)
const totalItems = ref(0)
const selected = ref(null)
const selectedChain = ref([])
const showModal = ref(false)

const config = useRuntimeConfig()
const api = useApi()
const router = useRouter()

const fetchLogs = async () => {
    loading.value = true
    try {
        const params = { page: page.value, limit: limit.value }
        if (entity.value) params.entity = entity.value
        if (action.value) params.action = action.value
        if (performedBy.value) params.performedBy = performedBy.value
        if (startDate.value) params.startDate = new Date(startDate.value).toISOString()
        if (endDate.value) params.endDate = new Date(endDate.value).toISOString()
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

const exportCsv = async () => {
    try {
        const params = { entity: entity.value, action: action.value }
        if (performedBy.value) params.performedBy = performedBy.value
        if (startDate.value) params.startDate = new Date(startDate.value).toISOString()
        if (endDate.value) params.endDate = new Date(endDate.value).toISOString()
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

const exportPage = async () => {
    try {
        const params = { entity: entity.value, action: action.value, page: page.value, limit: limit.value }
        if (performedBy.value) params.performedBy = performedBy.value
        if (startDate.value) params.startDate = new Date(startDate.value).toISOString()
        if (endDate.value) params.endDate = new Date(endDate.value).toISOString()
    const res = await api.get('/audit/export', { params, responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `audit-page-${page.value}-${new Date().toISOString()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
    } catch (e) { console.error('Export page failed', e) }
}

function shortMeta(m) {
    try {
        if (!m) return ''
        const s = typeof m === 'string' ? m : JSON.stringify(m)
        if (s.length > 120) return s.slice(0, 117) + '...'
        return s
    } catch (e) { return '' }
}

const openDetails = async (r) => {
    selected.value = r;
    showModal.value = true;
    selectedChain.value = [];
    try {
        // only for quotation entity we have created-from chain
        if (r && r.entity === 'quotation' && r.entityId) {
            const res = await api.get(`/quotation/${r.entityId}/created-from`);
            // expected { createdFrom, chain }
            selectedChain.value = (res && res.data && res.data.chain) ? res.data.chain : [];
        }
    } catch (e) {
        console.error('failed to fetch created-from chain', e);
        selectedChain.value = [];
    }
}
const closeDetails = () => { selected.value = null; showModal.value = false }

const prevPage = () => { if (page.value > 1) { page.value--; fetchLogs() } }
const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchLogs() } }

const firstPage = () => { if (page.value !== 1) { page.value = 1; fetchLogs() } }
const lastPage = () => { if (page.value !== totalPages.value) { page.value = totalPages.value; fetchLogs() } }
const goToPage = (p) => { const n = Number(p); if (!isNaN(n) && n >= 1 && n <= totalPages.value) { page.value = n; fetchLogs() } }

onMounted(fetchLogs)

function prettyMeta(m) {
    try {
        if (!m) return ''
        if (typeof m === 'string') return m
        return JSON.stringify(m, null, 2)
    } catch (e) { return '' }
}

// Return createdFrom id if metadata contains createdFrom reference (supports different shapes)
function createdFrom(r) {
    try {
        if (!r || !r.metadata) return null
        const m = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata
        if (!m) return null
        // support various shapes produced by backend
        if (m.createdFrom) return String(m.createdFrom)
        if (m.createdFromId) return String(m.createdFromId)
        if (m.sourceQuotationId) return String(m.sourceQuotationId)
        if (m.source_quotation_id) return String(m.source_quotation_id)
        if (m.from && (m.from.id || m.fromId)) return String(m.from.id || m.fromId)
        if (m.source && m.source.id) return String(m.source.id)
        return null
    } catch (e) { return null }
}

// Summarize an audit action from metadata for quick glance
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

function goToQuotation(id) {
    try {
        if (!id) return
        // if id is string, convert to number for route
        const nid = Number(id)
        router.push(`/controller/quotation/${isNaN(nid) ? id : nid}`)
    } catch (e) { console.error('navigate', e) }
}
</script>

<style scoped>
.max-w-2xl {
    max-width: 720px;
}
</style>
