<template>
    <div>This is Home</div>

    <div v-if="error">Error : {{ error.message }}</div>
    <div v-if="data && data.length > 0">
        <div v-for="(staff, index) in data" :key="index">
            <p>Name: {{ staff.firstName }}</p>
            <p>Lastname: {{ staff.lastName }}</p>
            <p>Email : {{ staff.email }}</p>
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
    } catch (err) {
        error.value = err
        console.error('Error fetching data:', err)
    }
})
</script>