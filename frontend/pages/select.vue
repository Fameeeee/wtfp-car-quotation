<template>
    <div class="container">
        <div class="topic">รุ่นรถ</div>
        <div class="content">
            <selectCar />
        </div>
    </div>
</template>

<script setup>
definePageMeta({
        middleware: 'auth'
    })

import selectCar from '~/components/user/selectCar.vue';
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 16px;
}

.content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
    margin-bottom: 20px;
}

</style>