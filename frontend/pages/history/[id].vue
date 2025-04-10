<template>
    <div class="container">
        <NuxtLink to="/history">
            <button>
                < Back </button>
        </NuxtLink>
        <div>This is history detail</div>
    </div>
</template>

<script setup>
import {useRoute} from 'vue-router'

const quotationId = useRoute().params.id
console.log(quotationId)

definePageMeta({
    middleware: 'staff-auth'
})
</script>