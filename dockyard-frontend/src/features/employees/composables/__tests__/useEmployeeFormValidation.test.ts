import { beforeEach, describe, expect, it } from 'vitest'

import { useEmployeeFormValidation } from '@/features/employees/composables/useEmployeeFormValidation'

describe('useEmployeeFormValidation', () => {
  let validation: ReturnType<typeof useEmployeeFormValidation>

  beforeEach(() => {
    validation = useEmployeeFormValidation()
  })

  describe('validate', () => {
    it('should return true for valid form data', () => {
      const formData = {
        name: 'John Doe',
        title: 'Software Engineer',
        timezone: 'America/New_York',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(true)
      expect(validation.errors.value).toEqual({})
    })

    it('should return false when name is empty', () => {
      const formData = {
        name: '',
        title: 'Software Engineer',
        timezone: 'America/New_York',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.name).toBe('Name is required')
    })

    it('should return false when name is only whitespace', () => {
      const formData = {
        name: '   ',
        title: 'Software Engineer',
        timezone: 'America/New_York',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.name).toBe('Name is required')
    })

    it('should return false when title is empty', () => {
      const formData = {
        name: 'John Doe',
        title: '',
        timezone: 'America/New_York',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.title).toBe('Title is required')
    })

    it('should return false when title is only whitespace', () => {
      const formData = {
        name: 'John Doe',
        title: '  \t\n  ',
        timezone: 'America/New_York',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.title).toBe('Title is required')
    })

    it('should return false when timezone is empty', () => {
      const formData = {
        name: 'John Doe',
        title: 'Software Engineer',
        timezone: '',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.timezone).toBe('Timezone is required')
    })

    it('should return false when timezone is only whitespace', () => {
      const formData = {
        name: 'John Doe',
        title: 'Software Engineer',
        timezone: '   ',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value.timezone).toBe('Timezone is required')
    })

    it('should collect multiple validation errors at once', () => {
      const formData = {
        name: '',
        title: '',
        timezone: '',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value).toEqual({
        name: 'Name is required',
        title: 'Title is required',
        timezone: 'Timezone is required',
      })
    })

    it('should reset previous errors on new validation', () => {
      // First validation with errors
      validation.validate({
        name: '',
        title: '',
        timezone: '',
      })

      expect(Object.keys(validation.errors.value).length).toBe(3)

      // Second validation with valid data
      const isValid = validation.validate({
        name: 'John Doe',
        title: 'Engineer',
        timezone: 'UTC',
      })

      expect(isValid).toBe(true)
      expect(validation.errors.value).toEqual({})
    })

    it('should handle partial valid/invalid combinations', () => {
      const formData = {
        name: 'John Doe',
        title: '',
        timezone: 'UTC',
      }

      const isValid = validation.validate(formData)

      expect(isValid).toBe(false)
      expect(validation.errors.value).toEqual({
        title: 'Title is required',
      })
    })
  })

  describe('clearErrors', () => {
    it('should clear all validation errors', () => {
      validation.validate({
        name: '',
        title: '',
        timezone: '',
      })

      expect(Object.keys(validation.errors.value).length).toBe(3)

      validation.clearErrors()

      expect(validation.errors.value).toEqual({})
    })

    it('should work even when no errors exist', () => {
      expect(validation.errors.value).toEqual({})

      validation.clearErrors()

      expect(validation.errors.value).toEqual({})
    })
  })

  describe('clearError', () => {
    it('should clear specific field error', () => {
      validation.validate({
        name: '',
        title: '',
        timezone: '',
      })

      validation.clearError('name')

      expect(validation.errors.value.name).toBeUndefined()
      expect(validation.errors.value.title).toBe('Title is required')
      expect(validation.errors.value.timezone).toBe('Timezone is required')
    })

    it('should not affect other errors when clearing one', () => {
      validation.validate({
        name: '',
        title: '',
        timezone: '',
      })

      validation.clearError('title')

      expect(validation.errors.value).toEqual({
        name: 'Name is required',
        timezone: 'Timezone is required',
      })
    })

    it('should handle clearing non-existent error gracefully', () => {
      validation.validate({
        name: 'John Doe',
        title: 'Engineer',
        timezone: 'UTC',
      })

      expect(() => validation.clearError('nonexistent')).not.toThrow()
      expect(validation.errors.value).toEqual({})
    })

    it('should clear multiple errors one by one', () => {
      validation.validate({
        name: '',
        title: '',
        timezone: '',
      })

      validation.clearError('name')
      validation.clearError('title')

      expect(validation.errors.value).toEqual({
        timezone: 'Timezone is required',
      })
    })
  })
})
