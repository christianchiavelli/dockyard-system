import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

export const useUIStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  let nextToastId = 0

  function showToast(message: string, type: ToastType = 'info', duration = 5000) {
    const id = nextToastId++
    const toast: Toast = { id, message, type, duration }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, duration?: number) {
    return showToast(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return showToast(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    return showToast(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    return showToast(message, 'info', duration)
  }

  function clearAllToasts() {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAllToasts,
  }
})
