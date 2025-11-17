/**
 * Employee Store - Pinia
 * Centralized state management for employees
 *
 * Features:
 * - CRUD operations (create, read, update, delete)
 * - Hierarchy management (drag & drop)
 * - Search functionality
 * - Loading & error states
 * - Computed getters (roots, subordinates, etc.)
 */

import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from '@/features/employees/types/employee.types'
import { computed, ref } from 'vue'

import { defineStore } from 'pinia'
import { employeeApi } from '@/features/employees/employee-api.service'

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const searchResults = ref<Employee[]>([])
  const searchLoading = ref(false)

  const totalEmployees = computed(() => employees.value.length)

  const rootEmployees = computed(() => employees.value.filter((emp) => emp.reports_to_id === null))

  const getEmployeeById = computed(() => {
    return (id: string) => employees.value.find((emp) => emp.id === id)
  })

  const getSubordinates = computed(() => {
    return (managerId: string) => employees.value.filter((emp) => emp.reports_to_id === managerId)
  })

  const hasSubordinates = computed(() => {
    return (employeeId: string) => employees.value.some((emp) => emp.reports_to_id === employeeId)
  })

  async function fetchAll() {
    loading.value = true
    error.value = null

    try {
      employees.value = await employeeApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load employees'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchEmployees(query: string) {
    if (!query.trim()) {
      searchResults.value = []
      return
    }

    searchLoading.value = true

    try {
      searchResults.value = await employeeApi.getAll(query)
    } catch (err) {
      searchResults.value = []
      console.error('Search failed:', err)
    } finally {
      searchLoading.value = false
    }
  }

  async function createEmployee(data: CreateEmployeeDto) {
    try {
      const newEmployee = await employeeApi.create(data)
      employees.value.push(newEmployee)

      // Update parent's subordinates if applicable
      if (newEmployee.reports_to_id) {
        const parent = employees.value.find((emp) => emp.id === newEmployee.reports_to_id)
        if (parent) {
          if (!parent.subordinates) {
            parent.subordinates = []
          }
          parent.subordinates.push(newEmployee)
        }
      }

      return newEmployee
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create employee'
      throw new Error(errorMsg)
    }
  }

  async function updateEmployee(id: string, data: UpdateEmployeeDto) {
    try {
      const updated = await employeeApi.update(id, data)

      // Update local state
      const index = employees.value.findIndex((emp) => emp.id === id)
      if (index !== -1) {
        employees.value[index] = updated
        // Force reactivity
        employees.value = [...employees.value]
      }

      return updated
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update employee'
      throw new Error(errorMsg)
    }
  }

  async function updateHierarchy(employeeId: string, newManagerId: string | null) {
    try {
      const updated = await employeeApi.updateHierarchy(employeeId, newManagerId)

      // Update local state
      const index = employees.value.findIndex((emp) => emp.id === employeeId)
      if (index !== -1) {
        employees.value[index] = updated
        employees.value = [...employees.value]
      }

      return updated
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update hierarchy'
      throw new Error(errorMsg)
    }
  }

  async function deleteEmployee(id: string) {
    try {
      await employeeApi.remove(id)

      // Remove from local state
      const employee = employees.value.find((emp) => emp.id === id)
      employees.value = employees.value.filter((emp) => emp.id !== id)

      // Remove from parent's subordinates
      if (employee?.reports_to_id) {
        const parent = employees.value.find((emp) => emp.id === employee.reports_to_id)
        if (parent?.subordinates) {
          parent.subordinates = parent.subordinates.filter((sub) => sub.id !== id)
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete employee'
      throw new Error(errorMsg)
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = []
  }

  function clearError() {
    error.value = null
  }

  // Reset store
  function $reset() {
    employees.value = []
    loading.value = false
    error.value = null
    searchQuery.value = ''
    searchResults.value = []
    searchLoading.value = false
  }

  return {
    // State
    employees,
    loading,
    error,
    searchQuery,
    searchResults,
    searchLoading,
    totalEmployees,
    rootEmployees,
    getEmployeeById,
    getSubordinates,
    hasSubordinates,
    fetchAll,
    searchEmployees,
    createEmployee,
    updateEmployee,
    updateHierarchy,
    deleteEmployee,
    setSearchQuery,
    clearSearch,
    clearError,
    $reset,
  }
})
