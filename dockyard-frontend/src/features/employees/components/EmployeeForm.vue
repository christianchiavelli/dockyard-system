<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'
import CustomSelect from '@/shared/components/ui/CustomSelect.vue'
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@/features/employees/types/employee.types'
import { useEmployeeFormValidation } from '@/features/employees/composables/useEmployeeFormValidation'
import { useEmployeeImageUpload } from '@/features/employees/composables/useEmployeeImageUpload'
import { useEmployeeManagerFilter } from '@/features/employees/composables/useEmployeeManagerFilter'
import { useEmployeeFormat } from '@/features/employees/composables/useEmployeeFormat'

interface Props {
  employee?: Employee
  parentId?: string | null
  allEmployees: Employee[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: CreateEmployeeDto | UpdateEmployeeDto]
  cancel: []
}>()

// Form mode
const isEditMode = computed(() => !!props.employee)

// Form data
const formData = ref({
  name: '',
  title: '',
  reports_to_id: null as string | null,
  profile_image_url: 'img/default-avatar.png',
  timezone: 'America/Sao_Paulo',
})

// Convert props to refs for composables
const allEmployeesRef = toRef(props, 'allEmployees')
const employeeRef = toRef(props, 'employee')

// Composables - each with a specific responsibility
const { errors, validate, clearError } = useEmployeeFormValidation()

const { formatTimezone } = useEmployeeFormat()

const {
  imagePreview,
  fileInputRef,
  imageError,
  handleImageUpload: handleImageUploadBase,
  removeImage: removeImageBase,
  triggerFileInput,
  setImagePreview,
  resetImage,
} = useEmployeeImageUpload()

const { managerOptions } = useEmployeeManagerFilter(allEmployeesRef, employeeRef, isEditMode)

// Wrap image upload to update formData
const handleImageUpload = (event: Event) => {
  handleImageUploadBase(event)

  // Watch imagePreview to update formData when ready
  const unwatch = watch(imagePreview, (newPreview) => {
    if (newPreview) {
      formData.value.profile_image_url = newPreview
      unwatch()
    }
  })
}

// Wrap remove image to update formData
const removeImage = () => {
  removeImageBase()
  formData.value.profile_image_url = ''
}

// Watch imageError to sync with form errors
watch(imageError, (newError) => {
  if (newError) {
    errors.value.profile_image_url = newError
  } else {
    clearError('profile_image_url')
  }
})

// Reset form to initial state
const resetForm = () => {
  formData.value = {
    name: '',
    title: '',
    reports_to_id: null,
    profile_image_url: '',
    timezone: 'America/Sao_Paulo',
  }
  resetImage()
  errors.value = {}
}

// Expose resetForm para ser chamado externamente
defineExpose({
  resetForm,
})

// Initialize form data
watch(
  () => props.employee,
  (employee) => {
    if (employee) {
      formData.value = {
        name: employee.name,
        title: employee.title,
        reports_to_id: employee.reports_to_id,
        profile_image_url: employee.profile_image_url,
        timezone: employee.timezone,
      }
      setImagePreview(employee.profile_image_url)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// Set parent if provided (for Add Subordinate)
watch(
  () => props.parentId,
  (parentId) => {
    if (parentId !== undefined) {
      formData.value.reports_to_id = parentId
    }
  },
  { immediate: true },
)

// Submit form
const handleSubmit = () => {
  if (!validate(formData.value)) return

  const data = { ...formData.value }
  emit('submit', data)
}

// Cancel
const handleCancel = () => {
  emit('cancel')
}

const commonTimezones = [
  'America/Chicago',
  'America/Los_Angeles',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/Berlin',
  'Europe/London',
  'UTC',
]

// Timezone options for CustomSelect
const timezoneOptions = computed(() =>
  commonTimezones.map((tz) => ({
    value: tz,
    label: formatTimezone(tz),
  })),
)
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-5">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-semibold text-gray-900 mb-2">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        class="w-full px-4 py-3 border-2 rounded-xl transition-all outline-none"
        :class="
          errors.name
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-300 hover:border-brand-green focus:border-brand-green focus:ring-2 focus:ring-brand-green/20'
        "
        placeholder="John Doe"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
    </div>

    <!-- Title -->
    <div>
      <label for="title" class="block text-sm font-semibold text-gray-900 mb-2">
        Title <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        class="w-full px-4 py-3 border-2 rounded-xl transition-all outline-none"
        :class="
          errors.title
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-300 hover:border-brand-green focus:border-brand-green focus:ring-2 focus:ring-brand-green/20'
        "
        placeholder="Senior Developer"
      />
      <p v-if="errors.title" class="mt-1 text-sm text-red-500">{{ errors.title }}</p>
    </div>

    <!-- Profile Image Upload -->
    <div>
      <label class="block text-sm font-semibold text-gray-900 mb-2">
        Profile Image <span class="text-xs text-gray-500">(optional)</span>
      </label>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed rounded-xl p-4 md:p-6 transition-all cursor-pointer"
        :class="
          errors.profile_image_url
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-brand-green bg-gray-50'
        "
        @click="triggerFileInput"
      >
        <div v-if="imagePreview" class="flex items-center gap-4">
          <!-- Image Preview -->
          <img
            :src="imagePreview"
            alt="Preview"
            class="w-20 h-20 rounded-full object-cover border-2 border-brand-green shadow-lg"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900">✓ Image selected</p>
            <p class="text-xs text-gray-500 mt-0.5">
              {{
                formData.profile_image_url.startsWith('data:image')
                  ? `${Math.round(formData.profile_image_url.length / 1024)} KB`
                  : 'Ready to upload'
              }}
            </p>
          </div>
          <button
            type="button"
            @click.stop="removeImage"
            class="shrink-0 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            Remove
          </button>
        </div>

        <div v-else class="text-center">
          <PhotoIcon class="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p class="text-sm font-medium text-gray-900">Click to upload image</p>
          <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      </div>

      <p v-if="errors.profile_image_url" class="mt-1 text-sm text-red-500">
        {{ errors.profile_image_url }}
      </p>
    </div>

    <!-- Reports To (Manager) -->
    <div>
      <label class="block text-sm font-semibold text-gray-900 mb-2"> Reports To </label>
      <CustomSelect
        v-model="formData.reports_to_id"
        :options="managerOptions"
        placeholder="Select a manager"
        :disabled="parentId !== undefined && parentId !== null"
      />
      <p v-if="parentId !== undefined && parentId !== null" class="mt-1 text-sm text-gray-600">
        This employee will report to the selected parent
      </p>
    </div>

    <!-- Timezone -->
    <div>
      <label class="block text-sm font-semibold text-gray-900 mb-2">
        Timezone <span class="text-red-500">*</span>
      </label>
      <CustomSelect
        v-model="formData.timezone"
        :options="timezoneOptions"
        placeholder="Select timezone"
        :error="!!errors.timezone"
      />
      <p v-if="errors.timezone" class="mt-1 text-sm text-red-500">{{ errors.timezone }}</p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col md:flex-row gap-2 md:gap-3 pt-4 md:pt-6 border-t border-gray-200">
      <button
        type="button"
        @click="handleCancel"
        class="w-full md:flex-1 px-4 md:px-6 py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 text-sm md:text-base font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="w-full md:flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-brand-green text-white text-sm md:text-base font-semibold rounded-xl hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all cursor-pointer"
      >
        {{ isEditMode ? 'Update' : 'Create' }} Employee
      </button>
    </div>
  </form>
</template>
