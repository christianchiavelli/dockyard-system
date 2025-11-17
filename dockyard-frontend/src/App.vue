<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ToastContainer from '@/shared/components/feedback/ToastContainer.vue'
</script>

<template>
  <DefaultLayout>
    <RouterView />
  </DefaultLayout>
  <ToastContainer />
</template>
