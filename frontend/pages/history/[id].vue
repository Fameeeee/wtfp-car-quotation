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
definePageMeta({
    middleware: 'staff-auth'
})
</script>