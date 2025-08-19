<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import loading from "~/components/user/loading.vue";

const isLoading = ref(false);
const router = useRouter();

router.beforeEach(() => {
  isLoading.value = true;
});
router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="relative min-h-screen">
        <NuxtPage />
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white/70 z-40"
        >
          <loading />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<style>
body {
  font-family: "Noto Sans Thai", sans-serif;
  font-weight: 500;
  font-style: normal;
}
</style>
