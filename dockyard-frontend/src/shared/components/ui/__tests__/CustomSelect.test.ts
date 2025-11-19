import { describe, expect, it, vi } from 'vitest'

import CustomSelect from '@/shared/components/ui/CustomSelect.vue'
import { mount } from '@vue/test-utils'

vi.mock('@heroicons/vue/24/outline', () => ({
  ChevronDownIcon: { name: 'ChevronDownIcon', template: '<div class="chevron-icon"></div>' },
}))

describe('CustomSelect.vue', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ]

  describe('rendering', () => {
    it('should render with placeholder', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          placeholder: 'Select an option',
        },
      })

      expect(wrapper.text()).toContain('Select an option')
    })

    it('should render selected option label', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: 'option2',
          options: mockOptions,
        },
      })

      expect(wrapper.text()).toContain('Option 2')
    })

    it('should have button element', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
        },
      })

      expect(wrapper.find('button[type="button"]').exists()).toBe(true)
    })

    it('should apply error styling when error prop is true', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          error: true,
        },
      })

      const selectButton = wrapper.find('button')
      expect(selectButton.classes()).toContain('border-red-500')
    })

    it('should apply normal styling when no error', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          error: false,
        },
      })

      const selectButton = wrapper.find('button')
      expect(selectButton.classes()).toContain('border-gray-300')
    })
  })

  describe('disabled state', () => {
    it('should apply disabled styling', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          disabled: true,
        },
      })

      const selectButton = wrapper.find('button')
      expect(selectButton.attributes('disabled')).toBeDefined()
      expect(selectButton.classes()).toContain('cursor-not-allowed')
    })

    it('should not apply disabled styling when enabled', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          disabled: false,
        },
      })

      const selectButton = wrapper.find('button')
      expect(selectButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('empty options', () => {
    it('should handle empty options array', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: [],
          placeholder: 'No options',
        },
      })

      expect(wrapper.text()).toContain('No options')
    })

    it('should still render button with empty options', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: [],
        },
      })

      expect(wrapper.find('button').exists()).toBe(true)
    })
  })

  describe('selected option display', () => {
    it('should show correct label for selected value', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: 'option1',
          options: mockOptions,
        },
      })

      expect(wrapper.text()).toContain('Option 1')
    })

    it('should show placeholder when value is empty string', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
          placeholder: 'Choose one',
        },
      })

      expect(wrapper.text()).toContain('Choose one')
    })

    it('should show placeholder when value is null', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
          placeholder: 'Select...',
        },
      })

      expect(wrapper.text()).toContain('Select...')
    })

    it('should show default placeholder when not specified', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: null,
          options: mockOptions,
        },
      })

      expect(wrapper.text()).toContain('Select an option')
    })
  })

  describe('option value mapping', () => {
    it('should correctly map option1 value to label', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: 'option1',
          options: mockOptions,
        },
      })

      expect(wrapper.text()).toContain('Option 1')
      expect(wrapper.text()).not.toContain('Option 2')
    })

    it('should correctly map option3 value to label', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: 'option3',
          options: mockOptions,
        },
      })

      expect(wrapper.text()).toContain('Option 3')
    })

    it('should show placeholder for unmapped value', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: 'nonexistent',
          options: mockOptions,
          placeholder: 'Unknown option',
        },
      })

      expect(wrapper.text()).toContain('Unknown option')
    })
  })

  describe('component structure', () => {
    it('should have relative positioning wrapper', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
        },
      })

      expect(wrapper.find('.relative').exists()).toBe(true)
    })

    it('should render ChevronDownIcon', () => {
      const wrapper = mount(CustomSelect, {
        props: {
          modelValue: '',
          options: mockOptions,
        },
      })

      expect(wrapper.find('.chevron-icon').exists()).toBe(true)
    })
  })
})
