<template>
  <div class="flex min-h-screen bg-[#ececec]">
    <AdminSidebar :isOpen="isSidebarOpen" @toggle="toggleSidebar" />

    <!-- Content wrapper: no left margin on mobile; responsive margins on desktop -->
    <div
      class="transition-all flex-1 min-w-0 ml-0 sm:ml-[80px]"
      :class="isSidebarOpen ? 'sm:ml-[280px]' : 'sm:ml-[80px]'"
    >
      <!-- Mobile top bar with hamburger -->
      <div class="sm:hidden sticky top-0 z-[80] bg-[#ececec] border-b border-gray-200 h-12 px-3 flex items-center">
        <button
          type="button"
          aria-label="Open sidebar"
          class="p-2 rounded-md hover:bg-gray-200 active:scale-95 transition"
          @click="toggleSidebar"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="black" />
          </svg>
        </button>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const isSidebarOpen = ref(false)
const route = useRoute()

function isMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640 // Tailwind sm breakpoint
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Close the drawer on route change for mobile to keep flow clean
watch(
  () => route.fullPath,
  () => {
    if (isMobile()) {
      isSidebarOpen.value = false
    }
  }
)
</script>
