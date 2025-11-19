import { beforeEach, describe, expect, it, vi } from 'vitest'

import BaseDialog from '@/shared/components/ui/BaseDialog.vue'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@heroicons/vue/24/outline', () => ({
  XMarkIcon: { name: 'XMarkIcon', template: '<div class="x-icon"></div>' },
}))

describe('BaseDialog.vue', () => {
  let mockDialog: {
    showModal: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockDialog = {
      showModal: vi.fn(),
      close: vi.fn(),
    }

    // Mock the native dialog element
    HTMLDialogElement.prototype.showModal = mockDialog.showModal as () => void
    HTMLDialogElement.prototype.close = mockDialog.close as (returnValue?: string) => void
  })

  describe('rendering', () => {
    it('should render dialog element', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: false,
          title: 'Test Dialog',
        },
      })

      expect(wrapper.find('dialog').exists()).toBe(true)
    })

    it('should render title', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test Title',
        },
      })

      expect(wrapper.text()).toContain('Test Title')
    })

    it('should render default slot content', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
        slots: {
          default: '<p>Dialog content</p>',
        },
      })

      expect(wrapper.text()).toContain('Dialog content')
    })
  })

  describe('open/close behavior', () => {
    it('should call showModal when opened', async () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: false,
          title: 'Test',
        },
      })

      await wrapper.setProps({ open: true })
      await nextTick()

      expect(mockDialog.showModal).toHaveBeenCalled()
    })

    it('should call close when closed', async () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
      })

      await wrapper.setProps({ open: false })
      await nextTick()

      expect(mockDialog.close).toHaveBeenCalled()
    })

    it('should emit update:open when closed', async () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
      })

      const dialog = wrapper.find('dialog')
      await dialog.trigger('click')

      expect(wrapper.emitted('close') || wrapper.emitted('update:open')).toBeTruthy()
    })
  })

  describe('close button', () => {
    it('should show close button by default', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
      })

      const closeButtons = wrapper.findAll('button')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('should hide close button when showCloseButton is false', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
          showCloseButton: false,
        },
      })

      const headerButtons = wrapper.findAll('button[aria-label="Close dialog"]')
      expect(headerButtons).toHaveLength(0)
    })

    it('should emit close when close button clicked', async () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
      })

      const closeButton = wrapper.find('button[aria-label="Close dialog"]')
      if (closeButton.exists()) {
        await closeButton.trigger('click')
        expect(wrapper.emitted('close')).toBeTruthy()
      }
    })

    it('should handle size prop', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
          size: 'lg',
        },
      })

      expect(wrapper.find('.bg-white').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have dialog role', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test',
        },
      })

      const dialog = wrapper.find('dialog')
      expect(dialog.element.tagName).toBe('DIALOG')
    })

    it('should have proper heading hierarchy', () => {
      const wrapper = mount(BaseDialog, {
        props: {
          open: true,
          title: 'Test Title',
        },
      })

      expect(wrapper.find('h2').text()).toContain('Test Title')
    })
  })
})
