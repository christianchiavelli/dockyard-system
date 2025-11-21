import { ref, computed, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'
import { useEmployeeFormat } from '@/features/employees/composables/useEmployeeFormat'

export function useDragAndDrop(
  allEmployees: Ref<Employee[]>,
  onDropSuccess?: (draggedId: string, newManagerId: string | null) => void,
) {
  const isDragging = ref(false)
  const isProcessing = ref(false)
  const draggedEmployee = ref<Employee | null>(null)
  const dropTarget = ref<Employee | null>(null)
  const dropZoneActive = ref<string | null>(null)

  let autoScrollInterval: ReturnType<typeof setInterval> | null = null

  const SCROLL_ZONE_SIZE = 80
  const SCROLL_SPEED = 8
  const DRAG_IMAGE_OFFSET_X = 150
  const DRAG_IMAGE_OFFSET_Y = 30

  const { getInitials, formatTimezone } = useEmployeeFormat()

  const createDragGhostElement = (employee: Employee): HTMLDivElement => {
    const ghost = document.createElement('div')
    ghost.className =
      'fixed pointer-events-none z-[9999] bg-white rounded-xl shadow-2xl border-2 border-brand-green p-4 min-w-[300px]'
    ghost.style.transform = 'rotate(-2deg)'

    const initials = getInitials(employee.name)
    const timezone = employee.timezone ? formatTimezone(employee.timezone) : ''

    ghost.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
          <span class="text-brand-green font-bold text-sm">${initials}</span>
        </div>
        <div class="flex-1">
          <div class="font-bold text-gray-900">${employee.name}</div>
          <div class="text-sm text-gray-600">${employee.title}</div>
          ${timezone ? `<div class="text-xs text-gray-500 mt-0.5">🌍 ${timezone}</div>` : ''}
        </div>
      </div>
    `

    return ghost
  }

  const handleAutoScroll = (event: DragEvent) => {
    const viewportHeight = window.innerHeight
    const mouseY = event.clientY

    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      autoScrollInterval = null
    }

    if (mouseY < SCROLL_ZONE_SIZE) {
      autoScrollInterval = setInterval(() => {
        window.scrollBy(0, -SCROLL_SPEED)
      }, 16)
    } else if (mouseY > viewportHeight - SCROLL_ZONE_SIZE) {
      autoScrollInterval = setInterval(() => {
        window.scrollBy(0, SCROLL_SPEED)
      }, 16)
    }
  }

  const stopAutoScroll = () => {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval)
      autoScrollInterval = null
    }
  }

  const wouldCreateCycle = (employeeId: string, newManagerId: string): boolean => {
    if (employeeId === newManagerId) {
      return true
    }

    let currentId: string | null = newManagerId

    while (currentId) {
      if (currentId === employeeId) {
        return true
      }

      const current = allEmployees.value.find((emp) => emp.id === currentId)
      if (!current) break

      currentId = current.reports_to_id
    }

    return false
  }

  const canDropOn = computed(() => {
    if (!draggedEmployee.value || !dropTarget.value) {
      return false
    }

    if (draggedEmployee.value.id === dropTarget.value.id) {
      return false
    }

    if (wouldCreateCycle(draggedEmployee.value.id, dropTarget.value.id)) {
      return false
    }

    return true
  })

  const handleDragStart = (employee: Employee, event: DragEvent) => {
    isDragging.value = true
    draggedEmployee.value = employee

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', employee.id)

      const ghost = createDragGhostElement(employee)
      document.body.appendChild(ghost)

      event.dataTransfer.setDragImage(ghost, DRAG_IMAGE_OFFSET_X, DRAG_IMAGE_OFFSET_Y)

      setTimeout(() => {
        ghost.remove()
      }, 0)
    }
  }

  const handleDragEnd = () => {
    isDragging.value = false
    draggedEmployee.value = null
    dropTarget.value = null
    dropZoneActive.value = null
    stopAutoScroll()
  }

  const handleDragOver = (employee: Employee, event: DragEvent) => {
    event.preventDefault()

    dropTarget.value = employee

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = canDropOn.value ? 'move' : 'none'
    }

    handleAutoScroll(event)
  }

  const handleDragLeave = () => {
    dropTarget.value = null
  }

  const handleDrop = async (targetEmployee: Employee, event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggedEmployee.value) {
      return
    }

    if (!canDropOn.value) {
      handleDragEnd()
      return
    }

    if (draggedEmployee.value.reports_to_id === targetEmployee.id) {
      handleDragEnd()
      return
    }

    isProcessing.value = true

    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, targetEmployee.id)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  const handleDropAsRoot = async (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggedEmployee.value) {
      return
    }

    if (!draggedEmployee.value.reports_to_id) {
      handleDragEnd()
      return
    }

    isProcessing.value = true

    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, null)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  const handleDropZoneDragOver = (zoneId: string, event: DragEvent) => {
    event.preventDefault()
    dropZoneActive.value = zoneId

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }

    handleAutoScroll(event)
  }

  const handleDropZoneDragLeave = () => {
    dropZoneActive.value = null
  }

  const handleDropZoneDrop = async (targetEmployeeId: string, event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggedEmployee.value) {
      return
    }

    const targetEmployee = allEmployees.value.find((emp) => emp.id === targetEmployeeId)
    if (!targetEmployee) {
      handleDragEnd()
      return
    }

    // Validation: cannot create cycle (only if target has a parent)
    if (
      targetEmployee.reports_to_id &&
      wouldCreateCycle(draggedEmployee.value.id, targetEmployee.reports_to_id)
    ) {
      handleDragEnd()
      return
    }

    isProcessing.value = true

    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, targetEmployee.reports_to_id)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  const getDragClasses = (employee: Employee) => {
    if (isDragging.value && draggedEmployee.value?.id === employee.id) {
      return 'opacity-40 scale-95 cursor-grabbing ring-2 ring-brand-green ring-offset-2 shadow-2xl'
    }

    if (
      isDragging.value &&
      dropTarget.value?.id === employee.id &&
      draggedEmployee.value?.id !== employee.id
    ) {
      if (draggedEmployee.value?.reports_to_id === employee.id) {
        return 'ring-4 ring-red-500 bg-red-50 scale-[0.98] cursor-not-allowed transition-all duration-150'
      }

      if (canDropOn.value) {
        return 'ring-4 ring-brand-green bg-brand-green/5 scale-[1.02] shadow-xl cursor-pointer transition-all duration-150'
      } else {
        return 'ring-4 ring-red-500 bg-red-50 scale-[0.98] cursor-not-allowed transition-all duration-150'
      }
    }

    return isDragging.value ? 'cursor-grab hover:scale-[1.01] transition-transform' : 'cursor-grab'
  }

  const getDropZoneClasses = (zoneId: string) => {
    if (!isDragging.value) {
      return 'h-0 opacity-0'
    }

    if (zoneId === 'root-zone') {
      if (draggedEmployee.value && !draggedEmployee.value.reports_to_id) {
        return 'h-0 opacity-0'
      }
    } else if (zoneId.startsWith('before-')) {
      const targetEmployeeId = zoneId.replace('before-', '')
      const targetEmployee = allEmployees.value.find((emp) => emp.id === targetEmployeeId)

      if (targetEmployee && draggedEmployee.value) {
        if (draggedEmployee.value.id === targetEmployee.id) {
          return 'h-0 opacity-0'
        }

        const areSiblings = draggedEmployee.value.reports_to_id === targetEmployee.reports_to_id
        if (areSiblings) {
          return 'h-0 opacity-0'
        }
      }
    }

    if (dropZoneActive.value === zoneId) {
      return 'h-16 opacity-100 bg-brand-green/10 border-brand-green border-4 border-dashed'
    }

    return 'h-8 opacity-50 bg-gray-100 border-gray-300 border-2 border-dashed hover:h-12 hover:opacity-100 hover:border-brand-green'
  }

  return {
    isDragging,
    isProcessing,
    draggedEmployee,
    dropTarget,
    canDropOn,
    dropZoneActive,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropAsRoot,
    handleDropZoneDragOver,
    handleDropZoneDragLeave,
    handleDropZoneDrop,
    getDragClasses,
    getDropZoneClasses,
  }
}
