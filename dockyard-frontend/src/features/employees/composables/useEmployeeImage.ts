import { ref, computed, watch, type Ref } from 'vue'
import type { Employee } from '@/features/employees/types/employee.types'

/**
 * Composable to manage validation and state of profile images
 *
 * Responsibilities:
 * - Validate if the image is valid (base64 or URL)
 * - Manage error state when loading image
 * - Automatic reset when employee changes
 */
export function useEmployeeImage(employee: Ref<Employee>) {
  const imageLoadError = ref(false)

  // Validate if the image is valid for display
  const hasValidImage = computed(() => {
    const imageUrl = employee.value.profile_image_url

    if (!imageUrl || !imageUrl.trim()) {
      return false
    }

    // Base64 always valid
    if (imageUrl.startsWith('data:image')) {
      return true
    }

    // For path like "img/uuid.png", only valid if no error when loading
    return !imageLoadError.value
  })

  // Handler para erro ao carregar imagem
  const handleImageError = () => {
    imageLoadError.value = true
  }

  // Reset error state when employee changes
  watch(
    () => employee.value.profile_image_url,
    () => {
      imageLoadError.value = false
    },
  )

  return {
    hasValidImage,
    imageLoadError,
    handleImageError,
  }
}
