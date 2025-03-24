<template>
    <div class="container">
      <NuxtLink to="/controller/history">
        <button class="back-button">
          < Back </button>
      </NuxtLink>
      <div>Customer History......</div>
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    middleware: 'staff-auth'
  })
  </script>
  <style scoped>
  .back-button {
    padding: 10px 20px;
    font-size: 1rem;
    color: white;
    background-color: #d32f2f;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  </style>