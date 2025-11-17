<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const { size = 'xl' } = defineProps<Props>()

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
}
</script>

<template>
  <div :class="[maxWidthClasses[size], 'mx-auto px-4 sm:px-6 lg:px-8']">
    <slot />
  </div>
</template>
