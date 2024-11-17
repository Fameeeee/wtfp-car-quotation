<template>
    <div>This is Login Page</div>
    <NuxtLink to="/register">Register</NuxtLink>

    <div v-if="error">Error : {{ error.message }}</div>
    <div v-if="data && data.length > 0">
        <div v-for="(staff, index) in data" :key="index">
            <p>Name: {{ staff.firstName }}</p>
            <p>Lastname: {{ staff.lastName }}</p>
        </div>
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
        console.log(data.value)
    } catch (err) {
        error.value = err
        console.error('Error fetching data:', err)
    }
})
</script>

<style scoped></style>