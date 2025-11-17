import { ref } from 'vue'

export function useEmployeeImageUpload() {
  const imagePreview = ref<string | null>(null)
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const imageError = ref<string>('')

  const handleImageUpload = (event: Event): string | null => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return null

    // Validate file type
    if (!file.type.startsWith('image/')) {
      imageError.value = 'Please select a valid image file'
      return null
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      imageError.value = 'Image size must be less than 5MB'
      return null
    }

    // Create preview AND save as base64 (data URL)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      imagePreview.value = dataUrl
    }
    reader.readAsDataURL(file)

    // Clear error
    imageError.value = ''

    return 'loading' // Indicates processing
  }

  const removeImage = () => {
    imagePreview.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    imageError.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  const setImagePreview = (imageUrl: string | null) => {
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imagePreview.value = imageUrl
    } else {
      imagePreview.value = null
    }
  }

  const resetImage = () => {
    imagePreview.value = null
    imageError.value = ''
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  return {
    imagePreview,
    fileInputRef,
    imageError,
    handleImageUpload,
    removeImage,
    triggerFileInput,
    setImagePreview,
    resetImage,
  }
}
