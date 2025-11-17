import { ref, watch, nextTick, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'

/**
 * Composable to manage highlight and scroll when clicking on search result
 *
 * Responsibilities:
 * - Control highlight state
 * - Scroll to element
 * - Remove highlight after timeout
 */
export function useEmployeeHighlight(
  employee: Ref<Employee>,
  scrollToId: Ref<string>,
  cardRef: Ref<HTMLElement | null>,
) {
  const isHighlighted = ref(false)

  // Watch for when to scroll and add highlight
  watch(
    () => scrollToId.value,
    async (newId) => {
      if (newId && newId === employee.value.id && cardRef.value) {
        // Activate highlight
        isHighlighted.value = true

        await nextTick()
        setTimeout(() => {
          cardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)

        // Remove highlight after 3 seconds
        setTimeout(() => {
          isHighlighted.value = false
        }, 3000)
      }
    },
  )

  return {
    isHighlighted,
  }
}
