import { ref } from 'vue'

interface FormData {
  name: string
  title: string
  timezone: string
  [key: string]: string | null | undefined
}

export function useEmployeeFormValidation() {
  const errors = ref<Record<string, string>>({})

  const validate = (formData: FormData): boolean => {
    errors.value = {}

    if (!formData.name.trim()) {
      errors.value.name = 'Name is required'
    }

    if (!formData.title.trim()) {
      errors.value.title = 'Title is required'
    }

    if (!formData.timezone.trim()) {
      errors.value.timezone = 'Timezone is required'
    }

    return Object.keys(errors.value).length === 0
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearError = (field: string) => {
    delete errors.value[field]
  }

  return {
    errors,
    validate,
    clearErrors,
    clearError,
  }
}
