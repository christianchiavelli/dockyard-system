import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { Employee } from '@/features/employees/types/employee.types'
import { employeeApi } from '@/features/employees/employee-api.service'
import { useEmployeeStore } from '../employee.store'

// Mock the API
vi.mock('@/features/employees/employee-api.service', () => ({
  employeeApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateHierarchy: vi.fn(),
    remove: vi.fn(),
  },
}))

describe('useEmployeeStore', () => {
  let mockEmployees: Employee[]

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Mock data
    mockEmployees = [
      {
        id: '1',
        name: 'John Doe',
        title: 'CEO',
        reports_to_id: null,
        profile_image_url: '',
        timezone: 'America/New_York',
      },
      {
        id: '2',
        name: 'Jane Smith',
        title: 'CTO',
        reports_to_id: '1',
        profile_image_url: '',
        timezone: 'America/New_York',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        title: 'Developer',
        reports_to_id: '2',
        profile_image_url: '',
        timezone: 'America/New_York',
      },
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const store = useEmployeeStore()

      expect(store.employees).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.searchQuery).toBe('')
      expect(store.searchResults).toEqual([])
      expect(store.searchLoading).toBe(false)
    })
  })

  describe('computed properties', () => {
    it('should calculate totalEmployees', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      expect(store.totalEmployees).toBe(3)
    })

    it('should return rootEmployees (no manager)', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      expect(store.rootEmployees).toHaveLength(1)
      expect(store.rootEmployees[0]?.name).toBe('John Doe')
    })

    it('should find employee by id', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      const employee = store.getEmployeeById('2')
      expect(employee?.name).toBe('Jane Smith')
    })

    it('should return undefined for non-existent id', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      const employee = store.getEmployeeById('999')
      expect(employee).toBeUndefined()
    })

    it('should get subordinates of a manager', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      const subordinates = store.getSubordinates('1')
      expect(subordinates).toHaveLength(1)
      expect(subordinates[0]?.name).toBe('Jane Smith')
    })

    it('should check if employee has subordinates', () => {
      const store = useEmployeeStore()
      store.employees = mockEmployees

      expect(store.hasSubordinates('1')).toBe(true)
      expect(store.hasSubordinates('3')).toBe(false)
    })
  })

  describe('fetchAll', () => {
    it('should fetch all employees successfully', async () => {
      const store = useEmployeeStore()
      vi.mocked(employeeApi.getAll).mockResolvedValue(mockEmployees)

      await store.fetchAll()

      expect(store.employees).toEqual(mockEmployees)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(employeeApi.getAll).toHaveBeenCalledOnce()
    })

    it('should set loading state during fetch', async () => {
      const store = useEmployeeStore()
      vi.mocked(employeeApi.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockEmployees), 100)),
      )

      const fetchPromise = store.fetchAll()
      expect(store.loading).toBe(true)

      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('should handle fetch errors', async () => {
      const store = useEmployeeStore()
      const errorMessage = 'Network error'
      vi.mocked(employeeApi.getAll).mockRejectedValue(new Error(errorMessage))

      await expect(store.fetchAll()).rejects.toThrow(errorMessage)

      expect(store.error).toBe(errorMessage)
      expect(store.loading).toBe(false)
    })

    it('should clear previous error on successful fetch', async () => {
      const store = useEmployeeStore()
      store.error = 'Previous error'
      vi.mocked(employeeApi.getAll).mockResolvedValue(mockEmployees)

      await store.fetchAll()

      expect(store.error).toBeNull()
    })
  })

  describe('searchEmployees', () => {
    it('should search employees successfully', async () => {
      const store = useEmployeeStore()
      const searchResults = [mockEmployees[0]!]
      vi.mocked(employeeApi.getAll).mockResolvedValue(searchResults)

      await store.searchEmployees('John')

      expect(store.searchResults).toEqual(searchResults)
      expect(store.searchLoading).toBe(false)
      expect(employeeApi.getAll).toHaveBeenCalledWith('John')
    })

    it('should clear results for empty query', async () => {
      const store = useEmployeeStore()
      store.searchResults = mockEmployees

      await store.searchEmployees('')

      expect(store.searchResults).toEqual([])
      expect(employeeApi.getAll).not.toHaveBeenCalled()
    })

    it('should clear results for whitespace-only query', async () => {
      const store = useEmployeeStore()
      store.searchResults = mockEmployees

      await store.searchEmployees('   ')

      expect(store.searchResults).toEqual([])
      expect(employeeApi.getAll).not.toHaveBeenCalled()
    })

    it('should handle search errors gracefully', async () => {
      const store = useEmployeeStore()
      vi.mocked(employeeApi.getAll).mockRejectedValue(new Error('Search failed'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await store.searchEmployees('test')

      expect(store.searchResults).toEqual([])
      expect(store.searchLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('createEmployee', () => {
    it('should create employee successfully', async () => {
      const store = useEmployeeStore()
      const newEmployee: Employee = {
        id: '4',
        name: 'New Employee',
        title: 'Manager',
        reports_to_id: null,
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      vi.mocked(employeeApi.create).mockResolvedValue(newEmployee)

      const result = await store.createEmployee({
        name: 'New Employee',
        title: 'Manager',
        profile_image_url: '',
        timezone: 'America/New_York',
      })

      expect(result).toEqual(newEmployee)
      expect(store.employees).toContainEqual(newEmployee)
    })

    it('should add employee to parent subordinates', async () => {
      const store = useEmployeeStore()
      store.employees = [mockEmployees[0]!]

      const newEmployee: Employee = {
        id: '5',
        name: 'Subordinate',
        title: 'Dev',
        reports_to_id: '1',
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      vi.mocked(employeeApi.create).mockResolvedValue(newEmployee)

      await store.createEmployee({
        name: 'Subordinate',
        title: 'Dev',
        reports_to_id: '1',
        profile_image_url: '',
        timezone: 'America/New_York',
      })

      const parent = store.employees.find((e) => e.id === '1')
      expect(parent?.subordinates).toContainEqual(newEmployee)
    })

    it('should handle create errors', async () => {
      const store = useEmployeeStore()
      vi.mocked(employeeApi.create).mockRejectedValue(new Error('Create failed'))

      await expect(
        store.createEmployee({
          name: 'Test',
          title: 'Test',
          profile_image_url: '',
          timezone: 'America/New_York',
        }),
      ).rejects.toThrow('Create failed')
    })
  })

  describe('updateEmployee', () => {
    it('should update employee successfully', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]

      const updated: Employee = {
        ...mockEmployees[1]!,
        title: 'Senior CTO',
      }
      vi.mocked(employeeApi.update).mockResolvedValue(updated)

      const result = await store.updateEmployee('2', { title: 'Senior CTO' })

      expect(result.title).toBe('Senior CTO')
      expect(store.employees.find((e) => e.id === '2')?.title).toBe('Senior CTO')
    })

    it('should handle update errors', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]
      vi.mocked(employeeApi.update).mockRejectedValue(new Error('Update failed'))

      await expect(store.updateEmployee('2', { title: 'New Title' })).rejects.toThrow(
        'Update failed',
      )
    })

    it('should force reactivity on update', async () => {
      const store = useEmployeeStore()
      const initialEmployees = [...mockEmployees]
      store.employees = initialEmployees

      const updated = { ...mockEmployees[0]!, title: 'Updated' }
      vi.mocked(employeeApi.update).mockResolvedValue(updated)

      await store.updateEmployee('1', { title: 'Updated' })

      // Array reference should change
      expect(store.employees).not.toBe(initialEmployees)
    })
  })

  describe('updateHierarchy', () => {
    it('should update hierarchy successfully', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]

      const updated: Employee = {
        ...mockEmployees[2]!,
        reports_to_id: '1',
      }
      vi.mocked(employeeApi.updateHierarchy).mockResolvedValue(updated)

      const result = await store.updateHierarchy('3', '1')

      expect(result.reports_to_id).toBe('1')
      expect(store.employees.find((e) => e.id === '3')?.reports_to_id).toBe('1')
    })

    it('should handle making employee root (null manager)', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]

      const updated: Employee = {
        ...mockEmployees[2]!,
        reports_to_id: null,
      }
      vi.mocked(employeeApi.updateHierarchy).mockResolvedValue(updated)

      await store.updateHierarchy('3', null)

      expect(store.employees.find((e) => e.id === '3')?.reports_to_id).toBeNull()
    })

    it('should handle hierarchy update errors', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]
      vi.mocked(employeeApi.updateHierarchy).mockRejectedValue(new Error('Hierarchy update failed'))

      await expect(store.updateHierarchy('3', '1')).rejects.toThrow('Hierarchy update failed')
    })
  })

  describe('deleteEmployee', () => {
    it('should delete employee successfully', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]
      vi.mocked(employeeApi.remove).mockResolvedValue(undefined)

      await store.deleteEmployee('3')

      expect(store.employees).toHaveLength(2)
      expect(store.employees.find((e) => e.id === '3')).toBeUndefined()
    })

    it('should remove employee from parent subordinates', async () => {
      const store = useEmployeeStore()
      const parentWithSubs: Employee = {
        ...mockEmployees[1]!,
        subordinates: [mockEmployees[2]!],
      }
      store.employees = [mockEmployees[0]!, parentWithSubs, mockEmployees[2]!]
      vi.mocked(employeeApi.remove).mockResolvedValue(undefined)

      await store.deleteEmployee('3')

      const parent = store.employees.find((e) => e.id === '2')
      expect(parent?.subordinates).toHaveLength(0)
    })

    it('should handle delete errors', async () => {
      const store = useEmployeeStore()
      store.employees = [...mockEmployees]
      vi.mocked(employeeApi.remove).mockRejectedValue(new Error('Delete failed'))

      await expect(store.deleteEmployee('3')).rejects.toThrow('Delete failed')
    })
  })

  describe('search management', () => {
    it('should set search query', () => {
      const store = useEmployeeStore()

      store.setSearchQuery('test query')

      expect(store.searchQuery).toBe('test query')
    })

    it('should clear search', () => {
      const store = useEmployeeStore()
      store.searchQuery = 'test'
      store.searchResults = mockEmployees

      store.clearSearch()

      expect(store.searchQuery).toBe('')
      expect(store.searchResults).toEqual([])
    })
  })

  describe('error management', () => {
    it('should clear error', () => {
      const store = useEmployeeStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })

  describe('$reset', () => {
    it('should reset all state', () => {
      const store = useEmployeeStore()

      // Set non-default values
      store.employees = mockEmployees
      store.loading = true
      store.error = 'Error'
      store.searchQuery = 'query'
      store.searchResults = mockEmployees
      store.searchLoading = true

      store.$reset()

      expect(store.employees).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.searchQuery).toBe('')
      expect(store.searchResults).toEqual([])
      expect(store.searchLoading).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty employees array', () => {
      const store = useEmployeeStore()
      store.employees = []

      expect(store.totalEmployees).toBe(0)
      expect(store.rootEmployees).toEqual([])
      expect(store.getSubordinates('1')).toEqual([])
    })

    it('should handle multiple root employees', () => {
      const store = useEmployeeStore()
      store.employees = [
        { ...mockEmployees[0]!, id: '1', reports_to_id: null },
        { ...mockEmployees[0]!, id: '2', reports_to_id: null },
        { ...mockEmployees[0]!, id: '3', reports_to_id: null },
      ]

      expect(store.rootEmployees).toHaveLength(3)
    })

    it('should handle creating employee without parent in store', async () => {
      const store = useEmployeeStore()
      store.employees = []

      const newEmployee: Employee = {
        id: '5',
        name: 'Orphan',
        title: 'Dev',
        reports_to_id: '999', // Parent doesn't exist
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      vi.mocked(employeeApi.create).mockResolvedValue(newEmployee)

      await store.createEmployee({
        name: 'Orphan',
        title: 'Dev',
        reports_to_id: '999',
        profile_image_url: '',
        timezone: 'America/New_York',
      })

      // Should not crash, just add employee
      expect(store.employees).toContainEqual(newEmployee)
    })
  })
})
