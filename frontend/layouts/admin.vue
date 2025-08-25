<template>
  <div class="flex min-h-screen bg-[#ececec]">
    <AdminSidebar :isOpen="isSidebarOpen" @toggle="isSidebarOpen = !isSidebarOpen" />

    <div
      class="transition-all flex-1"
      :style="{ marginLeft: isSidebarOpen ? '280px' : '80px' }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import { ref } from 'vue'

const isSidebarOpen = ref(false)
</script>
