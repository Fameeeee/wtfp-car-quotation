<template>
    <div class="layout">
        <AdminSidebar />
        <div class="main-content">
            <div class="header">
                <div class="title">Dashboard</div>
                <FilterDay />
            </div>
            <div class="first-row">
                <div><TopCar /></div>
                <div><QuotationTotal /></div>
                <div><CustomerTotal /></div>
            </div>
            <div class="second-row">

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
    layout: false
})
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
    height: 100vh;

}

.main-content {
    background: #ECECEC;
    display: flex;
    flex-direction: column;
    width: 100vw;
}

.title{
    font-size: 3vw;
}

.header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
}

.first-row{
    width: 100%;
    display: flex;
    justify-content: space-evenly;
}

@media (max-width: 425px) {
    .first-row{
        flex-direction: column;
    }
}
</style>