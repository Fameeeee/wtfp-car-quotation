<template>
    <div class="container">
        <div class="topic">หน้าหลัก</div>

        <!-- <div v-if="error">Error : {{ error.message }}</div>
    <div v-if="data && data.length > 0">
        <div v-for="(staff, index) in data" :key="index">
            <p>Name: {{ staff.firstName }}</p>
            <p>Lastname: {{ staff.lastName }}</p>
            <p>Email : {{ staff.email }}</p>
        </div>
    </div> -->
        <NuxtLink to="create" class="link">
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
    font-family: 'Roboto', sans-serif;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40px;
    padding: 16px;
    gap: 20px;
}


.topic {
    position: absolute;
    width: 200px;
    height: 40px;
    left: 15px;
    top: 105px;
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    color: #696969;
}

.group-button {
    width: 360px;
    height: 100px;
    left: 16px;
    top: 181px;
    background: none;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.button-title {
    font-family: 'Roboto', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 32px;
    line-height: 40px;
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
    .group-button{
        width:95vw;
    }
}
</style>
