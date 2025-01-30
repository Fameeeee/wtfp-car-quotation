<template>
    <div class="layout">
        <AdminSidebar />
        <div class="content">
            <div class="header">
                <div class="title">Dashboard</div>
                <FilterDay />
            </div>
            <div class="first-row">
                <div class="topcar">
                    <TopCar />
                </div>
                <div class="quotation-total">
                    <QuotationTotal />
                </div>
                <div class="customer-total">
                    <CustomerTotal />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import AdminSidebar from '~/components/admin/AdminSidebar.vue';
import TopCar from '~/components/admin/dashboard/TopCar.vue';
import QuotationTotal from '~/components/admin/dashboard/QuotationTotal.vue';
import CustomerTotal from '~/components/admin/dashboard/CustomerTotal.vue';
import FilterDay from '~/components/admin/dashboard/FilterDay.vue';

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

.first-row {
    width: 100%;
    display: flex;
    padding: 10px;
    justify-content: space-around;
    gap: 10px;
}


@media (max-width: 425px) {
    .first-row {
        flex-direction: column;
    }

    .content {
        margin-left: 0;
        max-width: 100vw;
    }

    .admin-sidebar {
        width: 100%;
        position: static;
        height: auto;
    }
}
</style>