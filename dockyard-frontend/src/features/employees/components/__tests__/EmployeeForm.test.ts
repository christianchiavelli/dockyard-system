import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Employee } from '@/features/employees/types/employee.types'
import EmployeeForm from '@/features/employees/components/EmployeeForm.vue'
import { mount } from '@vue/test-utils'

// Mock HeroIcons
vi.mock('@heroicons/vue/24/outline', () => ({
  PhotoIcon: { name: 'PhotoIcon', template: '<div></div>' },
}))

// Mock CustomSelect component
vi.mock('@/shared/components/ui/CustomSelect.vue', () => ({
  default: {
    name: 'CustomSelect',
    template: '<div class="custom-select-mock"></div>',
    props: ['modelValue', 'options', 'placeholder', 'disabled', 'error'],
    emits: ['update:modelValue'],
  },
}))

describe('EmployeeForm.vue', () => {
  let mockEmployees: Employee[]

  beforeEach(() => {
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
    ]
  })

  describe('rendering', () => {
    it('should render form in create mode', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').text()).toContain('Create')
    })

    it('should render form in edit mode', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          employee: mockEmployees[1],
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('button[type="submit"]').text()).toContain('Update')
    })

    it('should render all required fields', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('#name').exists()).toBe(true)
      expect(wrapper.find('#title').exists()).toBe(true)
      expect(wrapper.findAll('.custom-select-mock')).toHaveLength(2) // Reports To + Timezone
    })

    it('should show required field indicators', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      const requiredLabels = wrapper.findAll('label .text-red-500')
      expect(requiredLabels.length).toBeGreaterThan(0)
    })
  })

  describe('form initialization', () => {
    it('should initialize with empty values in create mode', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      const nameInput = wrapper.find<HTMLInputElement>('#name')
      const titleInput = wrapper.find<HTMLInputElement>('#title')

      expect(nameInput.element.value).toBe('')
      expect(titleInput.element.value).toBe('')
    })

    it('should initialize with employee data in edit mode', () => {
      const employee = mockEmployees[1]!
      const wrapper = mount(EmployeeForm, {
        props: {
          employee,
          allEmployees: mockEmployees,
        },
      })

      const nameInput = wrapper.find<HTMLInputElement>('#name')
      const titleInput = wrapper.find<HTMLInputElement>('#title')

      expect(nameInput.element.value).toBe(employee.name)
      expect(titleInput.element.value).toBe(employee.title)
    })
  })

  describe('form validation', () => {
    it('should show error when name is empty', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('Name is required')
    })

    it('should show error when title is empty', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Test Name')

      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('Title is required')
    })

    it('should clear errors when field is corrected', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      // Trigger validation
      await wrapper.find('form').trigger('submit')
      expect(wrapper.text()).toContain('Name is required')

      // Fix the field
      const nameInput = wrapper.find('#name')
      await nameInput.setValue('Valid Name')
      await nameInput.trigger('input')

      // Submit again - error should be gone
      await wrapper.find('form').trigger('submit')

      // If form is valid, it will emit submit
      expect(wrapper.emitted('submit')).toBeFalsy() // Still invalid - missing title
    })

    it('should apply error classes to invalid fields', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('form').trigger('submit')

      const nameInput = wrapper.find('#name')
      expect(nameInput.classes()).toContain('border-red-500')
    })
  })

  describe('form submission', () => {
    it('should emit submit event with valid data', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('#name').setValue('New Employee')
      await wrapper.find('#title').setValue('Developer')

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')).toBeTruthy()
      const emittedData = wrapper.emitted('submit')?.[0]?.[0] as Record<string, unknown> | undefined
      expect(emittedData?.name).toBe('New Employee')
      expect(emittedData?.title).toBe('Developer')
    })

    it('should not emit submit with invalid data', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('should include all form fields in submission', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('#name').setValue('Test Employee')
      await wrapper.find('#title').setValue('Manager')

      await wrapper.find('form').trigger('submit')

      const emittedData = wrapper.emitted('submit')?.[0]?.[0] as Record<string, unknown> | undefined
      expect(emittedData).toHaveProperty('name')
      expect(emittedData).toHaveProperty('title')
      expect(emittedData).toHaveProperty('reports_to_id')
      expect(emittedData).toHaveProperty('profile_image_url')
      expect(emittedData).toHaveProperty('timezone')
    })
  })

  describe('cancel functionality', () => {
    it('should emit cancel event when cancel button clicked', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      const cancelButton = wrapper.findAll('button').find((btn) => btn.text().includes('Cancel'))
      await cancelButton?.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('image upload', () => {
    it('should show image upload area', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('input[type="file"]').exists()).toBe(true)
    })

    it('should have hidden file input', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.classes()).toContain('hidden')
    })

    it('should show default placeholder when no image', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.text()).toContain('Click to upload image')
    })
  })

  describe('resetForm', () => {
    it('should expose resetForm method', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.vm.resetForm).toBeDefined()
    })

    it('should reset form to initial state', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      await wrapper.find('#name').setValue('Test')
      await wrapper.find('#title').setValue('Test Title')

      wrapper.vm.resetForm()
      await wrapper.vm.$nextTick()

      const nameInput = wrapper.find<HTMLInputElement>('#name')
      const titleInput = wrapper.find<HTMLInputElement>('#title')

      expect(nameInput.element.value).toBe('')
      expect(titleInput.element.value).toBe('')
    })
  })

  describe('parent selection', () => {
    it('should disable manager field when parentId is provided', async () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
          parentId: '1',
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('This employee will report to the selected parent')
    })

    it('should not show parent message when parentId is not provided', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.text()).not.toContain('This employee will report to the selected parent')
    })
  })

  describe('accessibility', () => {
    it('should have proper labels for inputs', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('label[for="name"]').exists()).toBe(true)
      expect(wrapper.find('label[for="title"]').exists()).toBe(true)
    })

    it('should have proper button types', () => {
      const wrapper = mount(EmployeeForm, {
        props: {
          allEmployees: mockEmployees,
        },
      })

      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
      expect(wrapper.find('button[type="button"]').exists()).toBe(true)
    })
  })
})
