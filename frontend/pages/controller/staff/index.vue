<template>
    <div class="layout">
        <AdminSidebar />
        <div class="main-content">
            <div class="header">
                <div class="title">Staff</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

definePageMeta({
    layout: false
})
</script>