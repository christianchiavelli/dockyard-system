<script setup lang="ts">
import { useRouter } from 'vue-router'
import Container from '@/shared/components/ui/Container.vue'
import FeatureCard from '@/shared/components/ui/FeatureCard.vue'
import StatCard from '@/shared/components/ui/StatCard.vue'
import BackgroundCarousel from '@/shared/components/ui/BackgroundCarousel.vue'
import { useImageCarousel } from '@/shared/composables/useImageCarousel'
import {
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BoltIcon,
  DevicePhoneMobileIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()

const goToHierarchy = () => {
  router.push('/hierarchy')
}

const { images: heroImages } = useImageCarousel()

const techStack = [
  { name: 'Vue 3', color: 'bg-green-500' },
  { name: 'TypeScript', color: 'bg-blue-500' },
  { name: 'Tailwind v4', color: 'bg-cyan-500' },
  { name: 'Vite', color: 'bg-purple-500' },
  { name: 'NestJS', color: 'bg-red-500' },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="hero-section pt-20 pb-32 relative">
      <!-- Background Carousel -->
      <BackgroundCarousel :images="heroImages" :interval="4000" class="opacity-30" />

      <!-- Gradient Overlay (Verde Loadsmart) -->
      <div class="hero-overlay"></div>

      <!-- Content Layer -->
      <Container class="relative z-10">
        <div class="text-center text-brand-light space-y-8 animate-fadeInUp">
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="text-brand-green">Visualize Your Organization</span>
            <br />
            <span class="text-white"> at Scale </span>
          </h1>

          <p class="text-xl sm:text-2xl opacity-90 max-w-3xl mx-auto">
            Interactive employee hierarchy visualization built with modern web technologies
          </p>

          <!-- CTA Button -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              @click="goToHierarchy"
              class="px-8 py-4 bg-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer flex items-center gap-2"
              style="color: #14d64d"
            >
              Explore Hierarchy
              <ArrowRightIcon class="w-5 h-5" />
            </button>

            <a
              href="https://github.com/yourusername/dockyard"
              target="_blank"
              class="px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </Container>

      <!-- Stats Cards - Desktop: overlap sections, Mobile: inline compact -->
      <Container class="hidden md:block absolute bottom-0 left-0 right-0 translate-y-1/2 z-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard :icon="UsersIcon" label="Total Employees" :value="1000" suffix="+" />
          <StatCard :icon="BriefcaseIcon" label="Unique Titles" :value="496" />
          <StatCard :icon="ChartBarIcon" label="Top-Level CEOs" :value="4" />
        </div>
      </Container>
    </section>

    <!-- Stats Cards Mobile - Compact version -->
    <section class="md:hidden py-8 bg-gray-50">
      <Container>
        <div class="grid grid-cols-3 gap-3">
          <!-- Compact Stat Card -->
          <div class="bg-white rounded-xl p-4 shadow-md text-center">
            <UsersIcon class="w-8 h-8 text-brand-green mx-auto mb-2" />
            <div class="text-2xl font-bold text-brand-green mb-1">1000+</div>
            <div class="text-xs font-semibold text-gray-600 uppercase">Employees</div>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-md text-center">
            <BriefcaseIcon class="w-8 h-8 text-brand-green mx-auto mb-2" />
            <div class="text-2xl font-bold text-brand-green mb-1">496</div>
            <div class="text-xs font-semibold text-gray-600 uppercase">Titles</div>
          </div>

          <div class="bg-white rounded-xl p-4 shadow-md text-center">
            <ChartBarIcon class="w-8 h-8 text-brand-green mx-auto mb-2" />
            <div class="text-2xl font-bold text-brand-green mb-1">4</div>
            <div class="text-xs font-semibold text-gray-600 uppercase">CEOs</div>
          </div>
        </div>
      </Container>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white md:pt-40">
      <Container>
        <div class="text-center mb-16 animate-fadeInUp max-w-7xl mx-auto">
          <h2 class="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            <span class="text-brand-dark">Powerful</span>
            <span class="text-brand-green"> Features</span>
          </h2>
          <p class="text-xl" style="color: #005454">
            Everything you need to manage and visualize your organizational structure
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <FeatureCard
            :icon="MagnifyingGlassIcon"
            title="Real-time Search"
            description="Instantly find employees with powerful search and filtering capabilities"
          />
          <FeatureCard
            :icon="Squares2X2Icon"
            title="Visual Hierarchy"
            description="Interactive tree view with expand/collapse functionality for easy navigation"
          />
          <FeatureCard
            :icon="BoltIcon"
            title="Lightning Fast"
            description="Built with modern tech stack for optimal performance and user experience"
          />
          <FeatureCard
            :icon="DevicePhoneMobileIcon"
            title="Mobile Responsive"
            description="Perfect experience on any device - desktop, tablet, or mobile"
          />
          <FeatureCard
            :icon="PaintBrushIcon"
            title="Modern Design"
            description="Clean, professional interface with smooth animations and micro-interactions"
          />
          <FeatureCard
            :icon="ShieldCheckIcon"
            title="Type Safe"
            description="Built with TypeScript for reliability and better developer experience"
          />
        </div>
      </Container>
    </section>

    <!-- Tech Stack Section -->
    <section class="py-20 bg-[--color-neutral-50]">
      <Container>
        <div class="text-center mb-12 max-w-7xl mx-auto">
          <h2 class="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            <span class="text-brand-dark">Built With</span>
            <span class="text-brand-green"> Modern Stack</span>
          </h2>
          <p class="text-xl" style="color: #005454">
            Leveraging the latest technologies for best performance
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-4 max-w-7xl mx-auto">
          <div
            v-for="tech in techStack"
            :key="tech.name"
            class="px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <span class="font-semibold text-[--color-neutral-800]">{{ tech.name }}</span>
          </div>
        </div>
      </Container>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-brand-dark relative overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 opacity-30">
        <img src="/images/10.jpg" class="w-full h-full object-cover" />
      </div>

      <!-- Content -->
      <Container class="relative z-10">
        <div class="text-center text-brand-light max-w-7xl mx-auto">
          <h2 class="text-4xl sm:text-5xl font-bold mb-6 animate-fadeInUp">
            <span class="text-brand-green">Ready to Explore?</span>
          </h2>
          <p class="text-xl opacity-90 mb-8">
            Dive into the interactive hierarchy and see the system in action
          </p>
          <button
            @click="goToHierarchy"
            class="px-10 py-5 bg-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer inline-flex items-center gap-2"
            style="color: #14d64d"
          >
            Get Started Now
            <ArrowRightIcon class="w-6 h-6" />
          </button>
        </div>
      </Container>
    </section>
  </div>
</template>
