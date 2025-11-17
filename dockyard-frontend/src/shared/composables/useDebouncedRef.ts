import { ref } from 'vue'

export function useDebouncedRef<T>(value: T, delay = 300) {
  const debouncedValue = ref<T>(value)
  let timeoutId: number | null = null

  const updateValue = (newValue: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }

  return {
    value: debouncedValue,
    update: updateValue,
  }
}
