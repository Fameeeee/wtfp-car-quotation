<template>
    <div class="container">
        <div class="topic">หน้าหลัก</div>

        <NuxtLink to="/select" class="link">
            <button class="group-button">
                <span class="button-title">สร้างใบเสนอราคา</span>
            </button>
        </NuxtLink>

        <NuxtLink to="/history" class="link">
            <button class="group-button">
                <span class="button-title">ประวัติการทำรายการ</span>
            </button>
        </NuxtLink>
    </div>


</template>

<script setup>
import { onMounted, ref } from 'vue'
const data = ref(null)
const error = ref(null)

onMounted(async () => {
    try {
        const response = await useNuxtApp().$axios.get('/staff')
        data.value = response.data
    } catch (err) {
        error.value = err
        console.error('Error fetching data:', err)
    }
})
</script>

<style scoped>
body,
html {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    gap: 20px;
}

.topic {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
}

.group-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90vw;
    height: 10vh;
    padding: 10px 20px;
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.button-title {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 32px;
    color: #696969;
    text-align: center;
}

.group-button:nth-of-type(2) {
    top: 301px;
}

.link {
    text-decoration: none;
}

@media (min-width: 768px) {
    .group-button {
        width: 95vw;
    }
}
</style>
