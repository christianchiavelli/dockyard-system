import { ref, computed, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'

export function useDragAndDrop(
  allEmployees: Ref<Employee[]>,
  onDropSuccess?: (draggedId: string, newManagerId: string | null) => void,
) {
  const isDragging = ref(false)
  const isProcessing = ref(false)
  const draggedEmployee = ref<Employee | null>(null)
  const dropTarget = ref<Employee | null>(null)
  const dropZoneActive = ref<string | null>(null)

  // Validation: check if it would create a cycle in the hierarchy
  const wouldCreateCycle = (employeeId: string, newManagerId: string): boolean => {
    // If trying to drop on itself
    if (employeeId === newManagerId) {
      return true
    }

    // Traverse the new manager's hierarchy upwards
    // If it finds the employee being dragged, it means it would create a cycle
    let currentId: string | null = newManagerId

    while (currentId) {
      if (currentId === employeeId) {
        return true
      }

      // Find the manager of this employee
      const current = allEmployees.value.find((emp) => emp.id === currentId)
      if (!current) break

      currentId = current.reports_to_id
    }

    return false
  }

  // Check if can drop on this target
  const canDropOn = computed(() => {
    if (!draggedEmployee.value || !dropTarget.value) {
      return false
    }

    // If trying to drop on itself
    if (draggedEmployee.value.id === dropTarget.value.id) {
      return false
    }

    // If it would create a cycle (subordinate becoming manager of the manager)
    if (wouldCreateCycle(draggedEmployee.value.id, dropTarget.value.id)) {
      return false
    }

    return true
  })

  const handleDragStart = (employee: Employee, event: DragEvent) => {
    isDragging.value = true
    draggedEmployee.value = employee

    // Set data for drag (fallback)
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', employee.id)

      // Create custom ghost card following the mouse
      const ghost = document.createElement('div')
      ghost.className =
        'fixed pointer-events-none z-[9999] bg-white rounded-xl shadow-2xl border-2 border-brand-green p-4 min-w-[300px]'
      ghost.style.transform = 'rotate(-2deg)'
      ghost.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
            <span class="text-brand-green font-bold text-sm">
              ${employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div class="flex-1">
            <div class="font-bold text-gray-900">${employee.name}</div>
            <div class="text-sm text-gray-600">${employee.title}</div>
          </div>
        </div>
      `

      // Add to body temporarily
      document.body.appendChild(ghost)

      // Set as drag image (offset to center on cursor)
      event.dataTransfer.setDragImage(ghost, 150, 30)

      // Remove after browser captures the image
      setTimeout(() => {
        ghost.remove()
      }, 0)
    }
  }

  // Handler: Drag end (canceled or completed)
  const handleDragEnd = () => {
    isDragging.value = false
    draggedEmployee.value = null
    dropTarget.value = null
    dropZoneActive.value = null
  }

  // Handler: Drag passing over a target
  const handleDragOver = (employee: Employee, event: DragEvent) => {
    event.preventDefault() // Required to allow drop

    dropTarget.value = employee

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = canDropOn.value ? 'move' : 'none'
    }
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

    // Validation: If already a direct subordinate of this manager, no point in moving
    if (draggedEmployee.value.reports_to_id === targetEmployee.id) {
      handleDragEnd()
      return
    }

    // Activate loading state
    isProcessing.value = true

    // Hierarchy change: make subordinate of target
    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, targetEmployee.id)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  // Handler: Drop to make root (Tier 1)
  const handleDropAsRoot = async (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!draggedEmployee.value) {
      return
    }

    // Validation: If already Tier 1 (root), don't allow
    if (!draggedEmployee.value.reports_to_id) {
      handleDragEnd()
      return
    }

    // Activate loading state
    isProcessing.value = true

    // Call callback with null (make root)
    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, null)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  // Handler: Drop Zone - Drag over zone
  const handleDropZoneDragOver = (zoneId: string, event: DragEvent) => {
    event.preventDefault()
    dropZoneActive.value = zoneId

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
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

    // Hierarchy change: make subordinate of target's PARENT (becomes sibling of target)
    if (onDropSuccess) {
      onDropSuccess(draggedEmployee.value.id, targetEmployee.reports_to_id)
    }

    isProcessing.value = false
    handleDragEnd()
  }

  const getDragClasses = (employee: Employee) => {
    // If being dragged
    if (isDragging.value && draggedEmployee.value?.id === employee.id) {
      return 'opacity-40 scale-95 cursor-grabbing ring-2 ring-brand-green ring-offset-2 shadow-2xl'
    }

    // If it's a valid target
    if (
      isDragging.value &&
      dropTarget.value?.id === employee.id &&
      draggedEmployee.value?.id !== employee.id
    ) {
      // If already the same parent, show as invalid
      if (draggedEmployee.value?.reports_to_id === employee.id) {
        return 'ring-4 ring-red-500 bg-red-50 scale-[0.98] cursor-not-allowed transition-all duration-150'
      }

      if (canDropOn.value) {
        return 'ring-4 ring-brand-green bg-brand-green/5 scale-[1.02] shadow-xl cursor-pointer transition-all duration-150'
      } else {
        return 'ring-4 ring-red-500 bg-red-50 scale-[0.98] cursor-not-allowed transition-all duration-150'
      }
    }

    // Default state with grab cursor when dragging
    return isDragging.value ? 'cursor-grab hover:scale-[1.01] transition-transform' : 'cursor-grab'
  }

  const getDropZoneClasses = (zoneId: string) => {
    if (!isDragging.value) {
      return 'h-0 opacity-0'
    }

    // Extract employeeId from zoneId (format: "before-{employeeId}" or "root-zone")
    if (zoneId === 'root-zone') {
      // If item is already Tier 1 (root), don't show root zone
      if (draggedEmployee.value && !draggedEmployee.value.reports_to_id) {
        return 'h-0 opacity-0'
      }
    } else if (zoneId.startsWith('before-')) {
      const targetEmployeeId = zoneId.replace('before-', '')
      const targetEmployee = allEmployees.value.find((emp) => emp.id === targetEmployeeId)

      if (targetEmployee && draggedEmployee.value) {
        // Don't show zone before itself
        if (draggedEmployee.value.id === targetEmployee.id) {
          return 'h-0 opacity-0'
        }

        // Don't show zones between siblings (same parent)
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
