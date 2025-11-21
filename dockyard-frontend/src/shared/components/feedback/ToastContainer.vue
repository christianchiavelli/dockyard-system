<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useToast } from '@/shared/composables/useToast'

const { toasts, remove } = useToast()

const getColors = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-400 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-400 text-red-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-400 text-yellow-800'
    default:
      return 'bg-blue-50 border-blue-400 text-blue-800'
  }
}

const getCloseButtonColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'hover:bg-green-100 text-green-700'
    case 'error':
      return 'hover:bg-red-100 text-red-700'
    case 'warning':
      return 'hover:bg-yellow-100 text-yellow-700'
    default:
      return 'hover:bg-blue-100 text-blue-700'
  }
}
</script>

<template>
  <div class="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-x-full"
      enter-to-class="opacity-100 translate-x-0"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-full"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between gap-4 min-w-[320px] max-w-[420px] px-5 py-3.5 rounded-lg border"
        :class="getColors(toast.type)"
      >
        <p class="flex-1 text-sm font-semibold leading-relaxed">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="shrink-0 w-6 h-6 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          :class="getCloseButtonColor(toast.type)"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
