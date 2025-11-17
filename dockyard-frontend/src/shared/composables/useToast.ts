import { useUIStore } from '@/stores'

export type { ToastType } from '@/stores'

export function useToast() {
  const uiStore = useUIStore()

  return {
    toasts: uiStore.toasts,
    show: uiStore.showToast,
    remove: uiStore.removeToast,
    success: uiStore.success,
    error: uiStore.error,
    warning: uiStore.warning,
    info: uiStore.info,
  }
}
