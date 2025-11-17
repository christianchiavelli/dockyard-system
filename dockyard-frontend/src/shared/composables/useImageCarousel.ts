import { ref } from 'vue'

export function useImageCarousel() {
  const images = ref<string[]>([])

  const modules = import.meta.glob('/public/images/*.{jpg,jpeg,png,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  })

  images.value = Object.keys(modules)
    .map((path) => path.replace('/public', ''))
    .sort()

  return {
    images,
  }
}
