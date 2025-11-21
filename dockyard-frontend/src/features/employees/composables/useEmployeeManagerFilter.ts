import { computed, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'

export function useEmployeeManagerFilter(
  allEmployees: Ref<Employee[]>,
  currentEmployee: Ref<Employee | undefined>,
  isEditMode: Ref<boolean>,
) {
  // Recursively find all descendants of an employee
  const findDescendants = (employeeId: string, excludedIds: Set<string>) => {
    allEmployees.value
      .filter((emp) => emp.reports_to_id === employeeId)
      .forEach((emp) => {
        excludedIds.add(emp.id)
        findDescendants(emp.id, excludedIds)
      })
  }

  // Available managers (exclude self and subordinates in edit mode)
  const availableManagers = computed(() => {
    if (!isEditMode.value || !currentEmployee.value) {
      return allEmployees.value
    }

    // In edit mode, exclude self and all descendants
    const excludedIds = new Set<string>([currentEmployee.value.id])

    // Recursively find all descendants
    findDescendants(currentEmployee.value.id, excludedIds)

    return allEmployees.value.filter((emp) => !excludedIds.has(emp.id))
  })

  // Manager options for select dropdown
  const managerOptions = computed(() => [
    { value: null, label: 'None (Tier 1 - Top Level)' },
    ...availableManagers.value.map((emp) => ({
      value: emp.id,
      label: `${emp.name} - ${emp.title}`,
    })),
  ])

  return {
    managerOptions,
  }
}
