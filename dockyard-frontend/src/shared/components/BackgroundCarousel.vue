<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  images: string[]
  interval?: number
  transitionDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  interval: 4000,
  transitionDuration: 1000,
})

const currentIndex = ref(0)
const isResetting = ref(false)
let intervalId: number | null = null

const duplicatedImages = computed(() => [...props.images, ...props.images])

const slideToNext = () => {
  if (isResetting.value) return

  currentIndex.value++

  if (currentIndex.value === props.images.length) {
    setTimeout(() => {
      isResetting.value = true
      currentIndex.value = 0

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isResetting.value = false
        })
      })
    }, props.transitionDuration)
  }
}

const startCarousel = () => {
  intervalId = window.setInterval(() => {
    slideToNext()
  }, props.interval)
}

onMounted(() => {
  if (props.images.length > 1) {
    startCarousel()
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="carousel-container">
    <div
      v-for="(image, index) in duplicatedImages"
      :key="`slide-${index}`"
      class="carousel-slide"
      :class="{
        active: index === currentIndex,
        'no-transition': isResetting,
      }"
      :style="{ backgroundImage: `url('${image}')` }"
    ></div>
  </div>
</template>

<style scoped>
.carousel-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: translateX(100%);
  transition: transform v-bind('`${transitionDuration}ms`') cubic-bezier(0.65, 0, 0.35, 1);
}

.carousel-slide.no-transition {
  transition: none;
}

.carousel-slide.active {
  transform: translateX(0);
  z-index: 2;
}
</style>
