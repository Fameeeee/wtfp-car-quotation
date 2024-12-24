<template>
    <div>
      <p>{{ modelName || 'N/A' }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const modelName = ref('');
  const route = useRoute();
  
  onMounted(() => {
    modelName.value = decodeURIComponent(route.params.id || '');
  });

  </script>
  