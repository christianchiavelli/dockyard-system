import { ref, computed, nextTick, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'

export function useEmployeeTree(
  employee: Ref<Employee>,
  allEmployees: Ref<Employee[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  childRefs: Ref<any[]>,
  onToggle?: (expanded: boolean) => void,
) {
  const isExpanded = ref(false)

  // Calculate direct subordinates
  const subordinates = computed(() =>
    allEmployees.value.filter((emp) => emp.reports_to_id === employee.value.id),
  )

  const hasSubordinates = computed(() => subordinates.value.length > 0)

  // Collapse this node
  const collapse = () => {
    isExpanded.value = false
  }

  // Collapse all children (recursive)
  const collapseAllChildren = () => {
    childRefs.value.forEach((childRef) => {
      if (childRef && childRef.collapse) {
        childRef.collapse()
        childRef.collapseAllChildren()
      }
    })
  }

  // Toggle expansion with accordion behavior
  const toggleExpand = () => {
    if (hasSubordinates.value) {
      const willExpand = !isExpanded.value
      isExpanded.value = willExpand

      // Notify parent about the change (to collapse siblings)
      if (onToggle) {
        onToggle(willExpand)
      }

      // If collapsing, collapse all children too
      if (!willExpand) {
        collapseAllChildren()
      }
    }
  }

  // Check if an employee has a specific descendant (recursive)
  const hasDescendant = (employeeId: string, targetId: string): boolean => {
    const children = allEmployees.value.filter((emp) => emp.reports_to_id === employeeId)

    for (const child of children) {
      if (child.id === targetId) return true
      if (hasDescendant(child.id, targetId)) return true
    }

    return false
  }

  // Expand the path to a specific employee (for scroll on search)
  const expandPath = async (targetId: string): Promise<boolean> => {
    // If this is the target, just return true
    if (employee.value.id === targetId) {
      return true
    }

    // Check if any subordinate is the target or has the target as descendant
    for (let i = 0; i < subordinates.value.length; i++) {
      const subordinate = subordinates.value[i]
      if (!subordinate) continue

      if (subordinate.id === targetId || hasDescendant(subordinate.id, targetId)) {
        // Expand this node
        isExpanded.value = true
        await nextTick()

        // Call expandPath recursively on the correct child
        const childRef = childRefs.value[i]
        if (childRef && childRef.expandPath) {
          await childRef.expandPath(targetId)
        }

        return true
      }
    }

    return false
  }

  return {
    isExpanded,
    subordinates,
    hasSubordinates,
    toggleExpand,
    expandPath,
    collapse,
    collapseAllChildren,
  }
}
