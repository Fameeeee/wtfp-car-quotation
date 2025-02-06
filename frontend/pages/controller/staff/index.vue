<template>
    <div class="layout">
        <AdminSidebar />
        <div class="content">
            <div class="header">
                <div class="title">Staff</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

definePageMeta({
    layout: false,
    middleware: 'admin-auth',
})
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background: #ECECEC;
    width: 100vw;
}

.content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    flex: 1;
}

.title {
    font-size: 3vw;
}

.sidebar-collapsed+.content {
    margin-left: 80px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
}
</style>