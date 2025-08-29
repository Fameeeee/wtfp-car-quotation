<template>
  <nav class="w-full flex items-center justify-center mt-4 select-none" aria-label="Pagination">
    <!-- Mobile: compact -->
    <div class="flex sm:hidden items-center gap-2">
      <button
        class="px-3 py-2 rounded-md text-sm bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400"
        :disabled="page <= 1"
        @click="emitPage(page - 1)"
        aria-label="Previous page"
      >ก่อนหน้า</button>
      <span class="text-gray-700 text-sm">หน้า {{ page }} จาก {{ totalPages }}</span>
      <button
        class="px-3 py-2 rounded-md text-sm bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400"
        :disabled="page >= totalPages"
        @click="emitPage(page + 1)"
        aria-label="Next page"
      >ถัดไป</button>
    </div>

    <!-- Desktop: numbered -->
    <div class="hidden sm:flex items-center gap-2">
      <button
        class="px-3 py-2 rounded-md text-sm bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400"
        :disabled="page <= 1"
        @click="emitPage(page - 1)"
        aria-label="Previous page"
      >ก่อนหน้า</button>

      <button
        v-for="p in pages"
        :key="p.key"
        :disabled="p.ellipsis"
        @click="!p.ellipsis && emitPage(p.num)"
        class="min-w-[36px] h-9 px-2 rounded-md text-sm border border-gray-200"
        :class="p.num === page ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'"
      >
        <span v-if="p.ellipsis">…</span>
        <span v-else>{{ p.num }}</span>
      </button>

      <button
        class="px-3 py-2 rounded-md text-sm bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400"
        :disabled="page >= totalPages"
        @click="emitPage(page + 1)"
        aria-label="Next page"
      >ถัดไป</button>

      <div v-if="showPageSize" class="ml-3 flex items-center gap-2">
        <label class="text-sm text-gray-600">แถวต่อหน้า</label>
        <select
          class="h-9 rounded-md border border-gray-200 bg-white text-sm px-2"
          :value="pageSize"
          @change="emitPageSize(($event.target && $event.target.value) || ($event.currentTarget && $event.currentTarget.value))"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  showPageSize: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  pageSizeOptions: { type: Array, default: () => [5, 10, 15, 20, 25, 50] }
})

const emit = defineEmits(['update:page', 'update:pageSize'])

const pages = computed(() => {
  const res = []
  const total = Math.max(1, props.totalPages || 1)
  const current = Math.min(Math.max(1, props.page || 1), total)

  // up to 7 visible slots with ellipses: 1, 2, ..., n-1, n
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = start + windowSize - 1
  if (end > total) {
    end = total
    start = Math.max(1, end - windowSize + 1)
  }

  // always include first
  if (start > 1) {
  res.push({ key: 'p1', num: 1 })
  if (start > 2) res.push({ key: 'eL', num: -1, ellipsis: true })
  }

  for (let i = start; i <= end; i++) {
  res.push({ key: `p${i}`, num: i })
  }

  // always include last
  if (end < total) {
  if (end < total - 1) res.push({ key: 'eR', num: -1, ellipsis: true })
  res.push({ key: `p${total}`, num: total })
  }

  return res
})

function emitPage(p) {
  const n = Number(p)
  if (!Number.isFinite(n)) return
  const bounded = Math.min(Math.max(1, n), Math.max(1, props.totalPages || 1))
  if (bounded !== props.page) emit('update:page', bounded)
}

function emitPageSize(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return
  if (n !== props.pageSize) emit('update:pageSize', n)
}
</script>
