<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Component } from 'vue'

interface Props {
  label: string
  value: number
  suffix?: string
  icon: Component
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '',
})

const displayValue = ref(0)

onMounted(() => {
  const duration = 2000
  const steps = 60
  const increment = props.value / steps
  let current = 0

  const timer = setInterval(() => {
    current += increment
    if (current >= props.value) {
      displayValue.value = props.value
      clearInterval(timer)
    } else {
      displayValue.value = Math.floor(current)
    }
  }, duration / steps)
})
</script>

<template>
  <div
    class="bg-white rounded-2xl p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeInUp"
  >
    <div class="flex items-center gap-8">
      <component :is="icon" class="w-16 h-16 text-brand-dark shrink-0" />
      <div class="flex-1">
        <div class="text-5xl font-bold mb-2 leading-none text-brand-green">
          {{ displayValue }}{{ suffix }}
        </div>
        <div class="text-base font-semibold uppercase tracking-wider" style="color: #005454">
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>
