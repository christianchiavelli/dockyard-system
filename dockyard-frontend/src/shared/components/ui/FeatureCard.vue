<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  title: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="group bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
  >
    <component
      :is="icon"
      class="w-12 h-12 text-brand-green mb-6 group-hover:scale-110 transition-transform duration-300"
    />
    <h3 class="text-2xl font-bold text-[--color-neutral-900] mb-3">
      {{ title }}
    </h3>
    <p class="text-[--color-neutral-600] text-lg">
      {{ description }}
    </p>
  </div>
</template>
