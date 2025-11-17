<script setup lang="ts">
import { ref } from 'vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import Container from '@/shared/components/ui/Container.vue'

const mobileMenuOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-sm">
    <Container>
      <nav class="flex items-center justify-between py-4">
        <!-- Logo / Brand -->
        <div class="flex items-center">
          <router-link
            to="/"
            class="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
          >
            Dockyard
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            to="/hierarchy"
            class="text-[--color-neutral-700] hover:text-[--color-primary] font-medium transition-colors"
          >
            Employees
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-[--color-neutral-100] transition-colors"
        >
          <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6 text-[--color-neutral-700]" />
          <XMarkIcon v-else class="w-6 h-6 text-[--color-neutral-700]" />
        </button>
      </nav>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden pb-4 space-y-2">
        <router-link
          to="/hierarchy"
          class="block px-4 py-2 text-[--color-neutral-700] hover:bg-[--color-primary-light] hover:text-[--color-primary] rounded-lg transition-colors"
          @click="mobileMenuOpen = false"
        >
          Employees
        </router-link>
      </div>
    </Container>
  </header>
</template>
