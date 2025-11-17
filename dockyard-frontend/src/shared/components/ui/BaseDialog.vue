<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  open: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
  showCloseButton: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)

const sizeClasses = {
  sm: 'w-[96vw] md:w-auto max-w-md md:min-w-[400px]',
  md: 'w-[96vw] md:w-auto max-w-2xl md:min-w-[500px]',
  lg: 'w-[96vw] md:w-auto max-w-3xl md:min-w-[600px]',
  xl: 'w-[96vw] md:w-auto max-w-4xl md:min-w-[700px]',
}

// Open/close dialog
watch(
  () => props.open,
  (isOpen) => {
    if (!dialogRef.value) return

    if (isOpen) {
      dialogRef.value.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      dialogRef.value.close()
      document.body.style.overflow = ''
    }
  },
)

// Handle close
const handleClose = () => {
  emit('update:open', false)
  emit('close')
}

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  if (!dialogRef.value) return

  // Só fecha se clicar no backdrop (::backdrop pseudo-element)
  // event.target === dialogRef.value significa que clicou no backdrop
  if (event.target === dialogRef.value) {
    handleClose()
  }
}

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}

onMounted(() => {
  dialogRef.value?.addEventListener('click', handleBackdropClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  dialogRef.value?.removeEventListener('click', handleBackdropClick)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <dialog ref="dialogRef" class="dialog-custom backdrop:bg-brand-dark/80 backdrop:backdrop-blur-md">
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-brand-green/20"
      :class="sizeClasses[size]"
    >
      <!-- Header with Loadsmart theme -->
      <div
        class="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 bg-linear-to-r from-brand-dark to-brand-dark/95 border-b-2 border-brand-green"
      >
        <h2 class="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3">
          <span class="w-1 md:w-1.5 h-6 md:h-8 bg-brand-green rounded-full"></span>
          {{ title }}
        </h2>
        <button
          v-if="showCloseButton"
          @click="handleClose"
          class="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 bg-gray-50/50">
        <slot />
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog-custom {
  border: none;
  padding: 0.5rem;
  background: transparent;
  max-width: 100vw;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}

@media (min-width: 768px) {
  .dialog-custom {
    padding: 1rem;
    max-width: 95vw;
  }
}

.dialog-custom::backdrop {
  animation: fadeIn 0.25s ease-out;
}

.dialog-custom[open] {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
