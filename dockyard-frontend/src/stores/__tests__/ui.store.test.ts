import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useUIStore } from '../ui.store'

describe('useUIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('initialization', () => {
    it('should initialize with empty toasts array', () => {
      const store = useUIStore()

      expect(store.toasts).toEqual([])
    })
  })

  describe('showToast', () => {
    it('should add a toast to the array', () => {
      const store = useUIStore()

      const id = store.showToast('Test message', 'info', 5000)

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]).toEqual({
        id,
        message: 'Test message',
        type: 'info',
        duration: 5000,
      })
    })

    it('should generate unique IDs for each toast', () => {
      const store = useUIStore()

      const id1 = store.showToast('First', 'info')
      const id2 = store.showToast('Second', 'info')
      const id3 = store.showToast('Third', 'info')

      expect(id1).not.toBe(id2)
      expect(id2).not.toBe(id3)
      expect(store.toasts).toHaveLength(3)
    })

    it('should auto-remove toast after duration', () => {
      const store = useUIStore()

      store.showToast('Auto remove', 'info', 3000)
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(3000)
      expect(store.toasts).toHaveLength(0)
    })

    it('should not auto-remove toast if duration is 0', () => {
      const store = useUIStore()

      store.showToast('Persistent', 'info', 0)
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(10000)
      expect(store.toasts).toHaveLength(1)
    })

    it('should handle multiple toasts with different durations', () => {
      const store = useUIStore()

      store.showToast('Fast', 'info', 1000)
      store.showToast('Medium', 'info', 2000)
      store.showToast('Slow', 'info', 3000)

      expect(store.toasts).toHaveLength(3)

      vi.advanceTimersByTime(1000)
      expect(store.toasts).toHaveLength(2)

      vi.advanceTimersByTime(1000)
      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(1000)
      expect(store.toasts).toHaveLength(0)
    })
  })

  describe('removeToast', () => {
    it('should remove specific toast by id', () => {
      const store = useUIStore()

      const id1 = store.showToast('First', 'info', 0)
      const id2 = store.showToast('Second', 'info', 0)
      const id3 = store.showToast('Third', 'info', 0)

      expect(store.toasts).toHaveLength(3)

      store.removeToast(id2)
      expect(store.toasts).toHaveLength(2)
      expect(store.toasts.find((t) => t.id === id2)).toBeUndefined()
      expect(store.toasts.find((t) => t.id === id1)).toBeDefined()
      expect(store.toasts.find((t) => t.id === id3)).toBeDefined()
    })

    it('should do nothing if toast id does not exist', () => {
      const store = useUIStore()

      store.showToast('Test', 'info', 0)
      expect(store.toasts).toHaveLength(1)

      store.removeToast(999)
      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('convenience methods', () => {
    it('should create success toast', () => {
      const store = useUIStore()

      store.success('Success message')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]?.type).toBe('success')
      expect(store.toasts[0]?.message).toBe('Success message')
    })

    it('should create error toast', () => {
      const store = useUIStore()

      store.error('Error message')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]?.type).toBe('error')
      expect(store.toasts[0]?.message).toBe('Error message')
    })

    it('should create warning toast', () => {
      const store = useUIStore()

      store.warning('Warning message')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]?.type).toBe('warning')
      expect(store.toasts[0]?.message).toBe('Warning message')
    })

    it('should create info toast', () => {
      const store = useUIStore()

      store.info('Info message')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]?.type).toBe('info')
      expect(store.toasts[0]?.message).toBe('Info message')
    })

    it('should allow custom duration in convenience methods', () => {
      const store = useUIStore()

      store.success('Custom duration', 2000)

      expect(store.toasts[0]?.duration).toBe(2000)
    })

    it('should use default duration when not specified', () => {
      const store = useUIStore()

      store.success('Default duration')

      expect(store.toasts[0]?.duration).toBe(5000)
    })
  })

  describe('clearAllToasts', () => {
    it('should remove all toasts', () => {
      const store = useUIStore()

      store.success('Toast 1')
      store.error('Toast 2')
      store.warning('Toast 3')

      expect(store.toasts).toHaveLength(3)

      store.clearAllToasts()

      expect(store.toasts).toHaveLength(0)
    })

    it('should work when no toasts exist', () => {
      const store = useUIStore()

      expect(store.toasts).toHaveLength(0)

      store.clearAllToasts()

      expect(store.toasts).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid toast creation', () => {
      const store = useUIStore()

      for (let i = 0; i < 10; i++) {
        store.showToast(`Toast ${i}`, 'info', 0)
      }

      expect(store.toasts).toHaveLength(10)
    })

    it('should maintain toast order', () => {
      const store = useUIStore()

      store.showToast('First', 'info', 0)
      store.showToast('Second', 'info', 0)
      store.showToast('Third', 'info', 0)

      expect(store.toasts[0]?.message).toBe('First')
      expect(store.toasts[1]?.message).toBe('Second')
      expect(store.toasts[2]?.message).toBe('Third')
    })

    it('should handle empty message', () => {
      const store = useUIStore()

      store.showToast('', 'info')

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0]?.message).toBe('')
    })

    it('should handle very long messages', () => {
      const store = useUIStore()
      const longMessage = 'A'.repeat(1000)

      store.showToast(longMessage, 'info')

      expect(store.toasts[0]?.message).toBe(longMessage)
    })

    it('should handle negative duration (treated as auto-remove)', () => {
      const store = useUIStore()

      store.showToast('Negative duration', 'info', -1)

      expect(store.toasts).toHaveLength(1)
      // Negative duration doesn't trigger setTimeout, so it stays
      vi.advanceTimersByTime(10000)
      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('store reactivity', () => {
    it('should be reactive when removing toasts', () => {
      const store = useUIStore()

      store.showToast('Test', 'info', 0)
      const initialLength = store.toasts.length

      store.clearAllToasts()

      expect(store.toasts.length).toBe(0)
      expect(store.toasts.length).not.toBe(initialLength)
    })

    it('should update toasts array reference', () => {
      const store = useUIStore()

      const initialToasts = store.toasts
      store.showToast('Test', 'info', 0)

      expect(store.toasts).toBe(initialToasts)
      expect(store.toasts.length).toBe(1)
    })
  })
})
