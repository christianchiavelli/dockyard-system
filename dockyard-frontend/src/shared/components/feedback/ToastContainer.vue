<script setup lang="ts">
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { useToast } from '@/shared/composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return XCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    default:
      return InformationCircleIcon
  }
}

const getColors = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    default:
      return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    default:
      return 'text-blue-600'
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
        class="pointer-events-auto flex items-start gap-3 min-w-[320px] max-w-[420px] p-4 rounded-xl border-2 shadow-lg backdrop-blur-sm"
        :class="getColors(toast.type)"
      >
        <component
          :is="getIcon(toast.type)"
          class="w-6 h-6 shrink-0"
          :class="getIconColor(toast.type)"
        />
        <p class="flex-1 text-sm font-medium leading-relaxed">{{ toast.message }}</p>
        <button
          @click="remove(toast.id)"
          class="shrink-0 w-5 h-5 rounded-lg hover:bg-black/5 transition-colors flex items-center justify-center"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
