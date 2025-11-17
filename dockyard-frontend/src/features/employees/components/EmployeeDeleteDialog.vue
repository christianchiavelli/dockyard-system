<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import BaseDialog from '@/shared/components/ui/BaseDialog.vue'
import type { Employee } from '../types/employee.types'

interface Props {
  open: boolean
  employee: Employee | null
}

defineProps<Props>()

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <BaseDialog :open="open" title="Confirm Delete" size="md" @close="handleCancel">
    <div class="space-y-5">
      <!-- Employee Info Card -->
      <div
        v-if="employee"
        class="bg-linear-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-5"
      >
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-12 h-12 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md"
          >
            {{ employee.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ employee.name }}
            </h3>
            <p class="text-sm text-gray-600">
              {{ employee.title }}
            </p>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex gap-3">
          <div class="shrink-0">
            <ExclamationTriangleIcon class="w-5 h-5 text-red-600 mt-0.5" />
          </div>
          <div>
            <p class="text-sm text-red-800 leading-relaxed">
              Are you sure you want to delete this employee?
            </p>
            <p class="text-sm text-red-900 font-semibold mt-1">This action cannot be undone.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button
          type="button"
          @click="handleCancel"
          class="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleConfirm"
          class="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all cursor-pointer"
        >
          Delete Employee
        </button>
      </div>
    </div>
  </BaseDialog>
</template>
