<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Option {
  value: string | null
  label: string
}

interface Props {
  modelValue: string | null
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLDivElement | null>(null)

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)
})

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (value: string | null) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="selectRef" class="relative">
    <!-- Select Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all text-left relative"
      :class="[
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
          : error
            ? 'border-red-500 hover:border-red-600 bg-white'
            : 'border-gray-300 hover:border-brand-green focus:border-brand-green bg-white',
        isOpen && !disabled ? 'border-brand-green ring-2 ring-brand-green/20' : '',
      ]"
      :disabled="disabled"
    >
      <span class="block truncate" :class="selectedOption ? 'text-gray-900' : 'text-gray-400'">
        {{ selectedOption?.label || placeholder }}
      </span>
      <ChevronDownIcon
        class="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 transition-transform pointer-events-none"
        :class="[isOpen ? 'rotate-180' : '', disabled ? 'text-gray-400' : 'text-gray-600']"
      />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden"
      >
        <div class="max-h-60 overflow-y-auto">
          <button
            v-for="option in options"
            :key="option.value ?? 'null'"
            type="button"
            @click="selectOption(option.value)"
            class="w-full px-4 py-3 text-left transition-colors hover:bg-brand-green/5 flex items-center justify-between group"
            :class="
              option.value === modelValue
                ? 'bg-brand-green/10 text-brand-green font-semibold'
                : 'text-gray-700'
            "
          >
            <span>{{ option.label }}</span>
            <div
              v-if="option.value === modelValue"
              class="w-2 h-2 rounded-full bg-brand-green"
            ></div>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
