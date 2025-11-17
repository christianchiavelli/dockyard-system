<script setup lang="ts">
import Container from '@/shared/components/ui/Container.vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-brand-darker text-white mt-auto">
    <Container>
      <div class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand Section -->
          <div>
            <h3 class="text-2xl font-bold mb-3 text-gradient">Dockyard</h3>
            <p class="text-sm text-white/70">
              Employee management and hierarchy visualization platform.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul class="space-y-2 text-sm">
              <li>
                <router-link to="/" class="text-white/70 hover:text-brand-green transition-colors">
                  Employees
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Author -->
          <div>
            <h3 class="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Developer
            </h3>
            <p class="text-sm text-white/70 font-medium mb-2">Christian Chiavelli</p>
            <div class="space-y-1 text-sm">
              <a
                href="https://www.linkedin.com/in/christianchiavelli/"
                target="_blank"
                rel="noopener noreferrer"
                class="block text-white/70 hover:text-brand-green transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/christianchiavelli"
                target="_blank"
                rel="noopener noreferrer"
                class="block text-white/70 hover:text-brand-green transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-white/10 mt-8 pt-4 text-center text-sm text-white/50">
          © {{ currentYear }} Dockyard. All rights reserved.
        </div>
      </div>
    </Container>
  </footer>
</template>
