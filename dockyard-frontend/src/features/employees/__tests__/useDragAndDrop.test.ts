import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { useDragAndDrop } from '../composables/useDragAndDrop'
import type { Employee } from '@/features/employees/types/employee.types'

describe('useDragAndDrop', () => {
  let employees: Employee[]
  let employeesRef: Ref<Employee[]>

  beforeEach(() => {
    // Setup a simple hierarchy:
    // CEO (id: 1) -> CTO (id: 2) -> Lead (id: 3) -> Dev (id: 4)
    employees = [
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
        title: 'Tech Lead',
        reports_to_id: '2',
        profile_image_url: '',
        timezone: 'America/New_York',
      },
      {
        id: '4',
        name: 'Alice Williams',
        title: 'Developer',
        reports_to_id: '3',
        profile_image_url: '',
        timezone: 'America/New_York',
      },
    ]
    employeesRef = ref<Employee[]>(employees)
  })

  describe('wouldCreateCycle (cycle detection)', () => {
    it('should detect direct self-referencing cycle', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[0]!
      dropTarget.value = employees[0]!

      expect(canDropOn.value).toBe(false)
    })

    it('should detect cycle when dropping CEO on CTO (subordinate)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[0]! // CEO
      dropTarget.value = employees[1]! // CTO (reports to CEO)

      expect(canDropOn.value).toBe(false)
    })

    it('should detect cycle when dropping CEO on Lead (2 levels down)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[0]! // CEO
      dropTarget.value = employees[2]! // Lead (reports to CTO who reports to CEO)

      expect(canDropOn.value).toBe(false)
    })

    it('should detect cycle when dropping CEO on Dev (3 levels down)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[0]! // CEO
      dropTarget.value = employees[3]! // Dev (deep in hierarchy)

      expect(canDropOn.value).toBe(false)
    })

    it('should detect cycle when dropping CTO on Lead (direct subordinate)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[1]! // CTO
      dropTarget.value = employees[2]! // Lead (reports to CTO)

      expect(canDropOn.value).toBe(false)
    })

    it('should detect cycle when dropping CTO on Dev (2 levels down)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[1]! // CTO
      dropTarget.value = employees[3]! // Dev (reports to Lead who reports to CTO)

      expect(canDropOn.value).toBe(false)
    })

    it('should allow valid move: Dev to CEO (moving up)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[3]! // Dev
      dropTarget.value = employees[0]! // CEO

      expect(canDropOn.value).toBe(true)
    })

    it('should allow valid move: Dev to CTO (moving up)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[3]! // Dev
      dropTarget.value = employees[1]! // CTO

      expect(canDropOn.value).toBe(true)
    })

    it('should allow valid move: Lead to CEO (moving up)', () => {
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[2]! // Lead
      dropTarget.value = employees[0]! // CEO

      expect(canDropOn.value).toBe(true)
    })

    it('should allow valid move between different branches', () => {
      // Add another branch
      const cfo: Employee = {
        id: '5',
        name: 'Carol Brown',
        title: 'CFO',
        reports_to_id: '1',
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      employeesRef.value.push(cfo)

      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[3]! // Dev (under CTO branch)
      dropTarget.value = cfo // CFO (different branch)

      expect(canDropOn.value).toBe(true)
    })
  })

  describe('state management', () => {
    it('should initialize with correct default state', () => {
      const { isDragging, isProcessing, draggedEmployee, dropTarget, dropZoneActive } =
        useDragAndDrop(employeesRef)

      expect(isDragging.value).toBe(false)
      expect(isProcessing.value).toBe(false)
      expect(draggedEmployee.value).toBeNull()
      expect(dropTarget.value).toBeNull()
      expect(dropZoneActive.value).toBeNull()
    })

    it('should set isDragging and draggedEmployee on drag start', () => {
      const { isDragging, draggedEmployee, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[0]!, mockEvent)

      expect(isDragging.value).toBe(true)
      expect(draggedEmployee.value).toEqual(employees[0]!)
    })

    it('should reset state on drag end', () => {
      const { isDragging, draggedEmployee, dropTarget, handleDragStart, handleDragEnd } =
        useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[0]!, mockEvent)
      expect(isDragging.value).toBe(true)

      handleDragEnd()
      expect(isDragging.value).toBe(false)
      expect(draggedEmployee.value).toBeNull()
      expect(dropTarget.value).toBeNull()
    })

    it('should update dropTarget on drag over', () => {
      const { dropTarget, handleDragOver } = useDragAndDrop(employeesRef)

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          dropEffect: '',
        },
      } as unknown as DragEvent

      handleDragOver(employees[1]!, mockEvent)

      expect(dropTarget.value).toEqual(employees[1]!)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should clear dropTarget on drag leave', () => {
      const { dropTarget, handleDragOver, handleDragLeave } = useDragAndDrop(employeesRef)

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as DragEvent

      handleDragOver(employees[1]!, mockEvent)
      expect(dropTarget.value).toEqual(employees[1]!)

      handleDragLeave()
      expect(dropTarget.value).toBeNull()
    })
  })

  describe('drop operations', () => {
    it('should call onDropSuccess callback with correct params on valid drop', async () => {
      const onDropSuccess = vi.fn()
      const { dropTarget, handleDrop, handleDragStart } = useDragAndDrop(
        employeesRef,
        onDropSuccess,
      )

      const mockDragEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      // Start drag to set state
      handleDragStart(employees[3]!, mockDragEvent) // Dev
      dropTarget.value = employees[0]! // Set drop target to CEO

      const mockDropEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDrop(employees[0]!, mockDropEvent) // Drop on CEO

      expect(onDropSuccess).toHaveBeenCalledWith('4', '1')
      expect(mockDropEvent.preventDefault).toHaveBeenCalled()
      expect(mockDropEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should not call callback on invalid drop (cycle)', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[0]! // CEO

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDrop(employees[1]!, mockEvent) // Drop on CTO (subordinate)

      expect(onDropSuccess).not.toHaveBeenCalled()
    })

    it('should not call callback if already direct subordinate', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[1]! // CTO (already reports to CEO)

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDrop(employees[0]!, mockEvent) // Drop on CEO (current manager)

      expect(onDropSuccess).not.toHaveBeenCalled()
    })

    it('should handle drop as root (make Tier 1)', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDropAsRoot } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[3]! // Dev (currently has manager)

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDropAsRoot(mockEvent)

      expect(onDropSuccess).toHaveBeenCalledWith('4', null)
    })

    it('should not call callback if already root', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDropAsRoot } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[0]! // CEO (already root)

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDropAsRoot(mockEvent)

      expect(onDropSuccess).not.toHaveBeenCalled()
    })
  })

  describe('drop zone operations', () => {
    it('should activate drop zone on drag over', () => {
      const { dropZoneActive, handleDropZoneDragOver } = useDragAndDrop(employeesRef)

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as DragEvent

      handleDropZoneDragOver('before-2', mockEvent)

      expect(dropZoneActive.value).toBe('before-2')
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('should clear drop zone on drag leave', () => {
      const { dropZoneActive, handleDropZoneDragOver, handleDropZoneDragLeave } =
        useDragAndDrop(employeesRef)

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as DragEvent

      handleDropZoneDragOver('before-2', mockEvent)
      expect(dropZoneActive.value).toBe('before-2')

      handleDropZoneDragLeave()
      expect(dropZoneActive.value).toBeNull()
    })

    it('should handle drop zone drop (make sibling)', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDropZoneDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[3]! // Dev

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDropZoneDrop('2', mockEvent) // Drop before CTO (make sibling)

      expect(onDropSuccess).toHaveBeenCalledWith('4', '1') // Should report to CTO's manager (CEO)
    })

    it('should not allow drop zone drop that creates cycle', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDropZoneDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[0]! // CEO

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDropZoneDrop('2', mockEvent) // Drop before CTO

      expect(onDropSuccess).not.toHaveBeenCalled()
    })
  })

  describe('getDragClasses', () => {
    it('should return dragged class for currently dragged employee', () => {
      const { draggedEmployee, isDragging, getDragClasses, handleDragStart } =
        useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[0]!, mockEvent)

      const classes = getDragClasses(employees[0]!)

      expect(isDragging.value).toBe(true)
      expect(draggedEmployee.value?.id).toBe('1')
      expect(classes).toContain('opacity-40')
      expect(classes).toContain('cursor-grabbing')
    })

    it('should return valid drop target class', () => {
      const { dropTarget, isDragging, getDragClasses, handleDragStart } =
        useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[3]!, mockEvent) // Start dragging Dev
      dropTarget.value = employees[0]! // Hovering over CEO

      const classes = getDragClasses(employees[0]!)

      expect(isDragging.value).toBe(true)
      expect(classes).toContain('ring-brand-green')
      expect(classes).toContain('cursor-pointer')
    })

    it('should return invalid drop target class for cycle', () => {
      const { dropTarget, getDragClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[0]!, mockEvent) // Start dragging CEO
      dropTarget.value = employees[1]! // Hovering over CTO (subordinate)

      const classes = getDragClasses(employees[1]!)

      expect(classes).toContain('ring-red-500')
      expect(classes).toContain('cursor-not-allowed')
    })

    it('should return invalid class when already same parent', () => {
      const { dropTarget, getDragClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[1]!, mockEvent) // Start dragging CTO
      dropTarget.value = employees[0]! // Hovering over CEO (current manager)

      const classes = getDragClasses(employees[0]!)

      expect(classes).toContain('ring-red-500')
      expect(classes).toContain('cursor-not-allowed')
    })

    it('should return grab cursor when not dragging', () => {
      const { getDragClasses } = useDragAndDrop(employeesRef)

      const classes = getDragClasses(employees[0]!)

      expect(classes).toBe('cursor-grab')
    })
  })

  describe('getDropZoneClasses', () => {
    it('should hide drop zone when not dragging', () => {
      const { getDropZoneClasses } = useDragAndDrop(employeesRef)

      const classes = getDropZoneClasses('before-2')

      expect(classes).toContain('h-0')
      expect(classes).toContain('opacity-0')
    })

    it('should show active drop zone when dragging and hovering', () => {
      const { dropZoneActive, getDropZoneClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[3]!, mockEvent)
      dropZoneActive.value = 'before-2'

      const classes = getDropZoneClasses('before-2')

      expect(classes).toContain('h-16')
      expect(classes).toContain('opacity-100')
      expect(classes).toContain('border-brand-green')
    })

    it('should show inactive drop zone when dragging but not hovering', () => {
      const { getDropZoneClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[3]!, mockEvent)

      const classes = getDropZoneClasses('before-2')

      expect(classes).toContain('h-8')
      expect(classes).toContain('opacity-50')
    })

    it('should hide root zone if already Tier 1', () => {
      const { getDropZoneClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[0]!, mockEvent) // CEO is already root

      const classes = getDropZoneClasses('root-zone')

      expect(classes).toContain('h-0')
      expect(classes).toContain('opacity-0')
    })

    it('should hide zone before itself', () => {
      const { getDropZoneClasses, handleDragStart } = useDragAndDrop(employeesRef)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[1]!, mockEvent) // CTO

      const classes = getDropZoneClasses('before-2') // Before CTO itself

      expect(classes).toContain('h-0')
      expect(classes).toContain('opacity-0')
    })

    it('should hide zones between siblings', () => {
      const { getDropZoneClasses, handleDragStart } = useDragAndDrop(employeesRef)

      // Add sibling to CTO
      const cfo: Employee = {
        id: '5',
        name: 'Carol Brown',
        title: 'CFO',
        reports_to_id: '1', // Same parent as CTO
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      employeesRef.value.push(cfo)

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: vi.fn(),
          setDragImage: vi.fn(),
        },
      } as unknown as DragEvent

      handleDragStart(employees[1]!, mockEvent) // Start dragging CTO

      const classes = getDropZoneClasses('before-5') // Before CFO (sibling)

      expect(classes).toContain('h-0')
      expect(classes).toContain('opacity-0')
    })
  })

  describe('edge cases', () => {
    it('should return false for canDropOn when employee list is empty', () => {
      const emptyRef = ref<Employee[]>([])
      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(emptyRef)

      // Even if we set draggedEmployee and dropTarget manually,
      // canDropOn should be false because one of them will be null
      draggedEmployee.value = null
      dropTarget.value = null

      expect(canDropOn.value).toBe(false)
    })

    it('should handle null draggedEmployee on drop', async () => {
      const onDropSuccess = vi.fn()
      const { handleDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDrop(employees[0]!, mockEvent)

      expect(onDropSuccess).not.toHaveBeenCalled()
    })

    it('should handle missing target employee in drop zone', async () => {
      const onDropSuccess = vi.fn()
      const { draggedEmployee, handleDropZoneDrop } = useDragAndDrop(employeesRef, onDropSuccess)

      draggedEmployee.value = employees[3]!

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent

      await handleDropZoneDrop('999', mockEvent) // Non-existent ID

      expect(onDropSuccess).not.toHaveBeenCalled()
    })

    it('should handle complex hierarchy with multiple levels', () => {
      // Add more levels
      const deepEmployee: Employee = {
        id: '5',
        name: 'Deep Employee',
        title: 'Junior Dev',
        reports_to_id: '4', // Reports to Dev
        profile_image_url: '',
        timezone: 'America/New_York',
      }
      employeesRef.value.push(deepEmployee)

      const { canDropOn, draggedEmployee, dropTarget } = useDragAndDrop(employeesRef)

      draggedEmployee.value = employees[0]! // CEO
      dropTarget.value = deepEmployee // 4 levels down

      expect(canDropOn.value).toBe(false)
    })
  })
})
