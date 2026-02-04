<script setup lang="ts">
import { useApplicationStore } from '~/stores/application'
import { useAuthStore } from '~/stores/auth'
import {
  Sparkles,
  Briefcase,
  Search,
  FileCheck,
  ChevronRight,
  Building2,
  MapPin,
  Wifi,
  ArrowRight,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

useHead({
  title: 'Careers - Telkomsel',
})

const applicationStore = useApplicationStore()
const authStore = useAuthStore()

// Get featured positions (first 4)
const featuredPositions = computed(() => applicationStore.availablePositions.slice(0, 4))

const steps = [
  { 
    id: 1, 
    title: 'Browse Positions', 
    description: 'Explore our open positions and find the role that matches your skills',
    icon: Search,
  },
  { 
    id: 2, 
    title: 'View Details', 
    description: 'Learn about the job requirements, responsibilities, and benefits',
    icon: FileCheck,
  },
  { 
    id: 3, 
    title: 'Apply', 
    description: 'Upload your CV and get your profile analyzed',
    icon: Sparkles,
  },
  { 
    id: 4, 
    title: 'Track Status', 
    description: 'Monitor your application progress in real-time',
    icon: Briefcase,
  },
]

const typeColors: Record<string, string> = {
  'full-time': 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  'part-time': 'bg-score-average/20 text-score-average border-score-average/30',
  'contract': 'bg-ai-orange/20 text-ai-orange border-ai-orange/30',
  'internship': 'bg-ai-red/20 text-ai-red border-ai-red/30',
}
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <div class="text-center space-y-6 max-w-3xl mx-auto pt-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <Sparkles class="w-4 h-4" />
        Recruitment
      </div>
      <h1 class="text-4xl lg:text-5xl font-bold text-foreground">
        Find Your Perfect Role at <span class="ai-text-gradient">Telkomsel</span>
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Join Indonesia's leading digital telco company. We're looking for talented individuals who are passionate about technology and innovation.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
        <NuxtLink
          to="/apply/positions"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Search class="w-5 h-5" />
          Browse Open Positions
        </NuxtLink>
        <NuxtLink
          v-if="authStore.isAuthenticated"
          to="/apply/status"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors font-medium text-foreground"
        >
          <FileCheck class="w-5 h-5" />
          Check My Applications
        </NuxtLink>
      </div>
    </div>

    <!-- How it Works -->
    <div class="space-y-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-foreground mb-2">How to Apply</h2>
        <p class="text-muted-foreground">Simple steps to start your career journey with us</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="relative glass-card p-6 text-center"
        >
          <!-- Step number -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-t from-ai-orange to-ai-red text-white text-sm font-bold flex items-center justify-center">
            {{ step.id }}
          </div>
          
          <!-- Arrow between steps (desktop) -->
          <div
            v-if="index < steps.length - 1"
            class="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10"
          >
            <ChevronRight class="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div class="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
            <component :is="step.icon" class="w-7 h-7 text-primary" />
          </div>
          <h3 class="font-semibold text-foreground mb-2">{{ step.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ step.description }}</p>
        </div>
      </div>
    </div>

    <!-- Featured Positions -->
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-2">Featured Positions</h2>
          <p class="text-muted-foreground">Latest opportunities waiting for you</p>
        </div>
        <NuxtLink
          to="/apply/positions"
          class="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          View All
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="position in featuredPositions"
          :key="position.id"
          :to="`/apply/positions/${position.id}`"
          class="glass-card-hover p-6 space-y-4 block"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-foreground">{{ position.title }}</h3>
              <div class="flex items-center gap-2 text-muted-foreground">
                <Building2 class="w-4 h-4" />
                <span class="text-sm">{{ position.department }}</span>
              </div>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium border capitalize',
                typeColors[position.type] || 'bg-muted text-muted-foreground',
              ]"
            >
              {{ position.type.replace('-', ' ') }}
            </span>
          </div>

          <p class="text-muted-foreground text-sm line-clamp-2">
            {{ position.description }}
          </p>

          <div class="flex flex-wrap gap-3">
            <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin class="w-4 h-4" />
              {{ position.location }}
            </div>
            <div v-if="position.remote" class="flex items-center gap-1.5 text-sm text-score-excellent">
              <Wifi class="w-4 h-4" />
              Remote Available
            </div>
          </div>

          <div class="pt-4 border-t border-border flex items-center justify-end">
            <span class="inline-flex items-center gap-2 text-primary font-medium text-sm">
              View Details
              <ChevronRight class="w-4 h-4" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Why Join Us -->
    <div class="space-y-8">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-foreground mb-2">Why Join Telkomsel?</h2>
        <p class="text-muted-foreground">Be part of Indonesia's digital transformation</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-ai-red/20 flex items-center justify-center mb-4">
            <Sparkles class="w-7 h-7 text-ai-red" />
          </div>
          <h3 class="font-semibold text-foreground mb-2">Innovation First</h3>
          <p class="text-sm text-muted-foreground">
            Work with cutting-edge technology and be at the forefront of digital innovation
          </p>
        </div>
        <div class="glass-card p-6 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-ai-orange/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-ai-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="font-semibold text-foreground mb-2">Great Team</h3>
          <p class="text-sm text-muted-foreground">
            Collaborate with talented professionals who are passionate about making an impact
          </p>
        </div>
        <div class="glass-card p-6 text-center">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-score-excellent/20 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-score-excellent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 class="font-semibold text-foreground mb-2">Career Growth</h3>
          <p class="text-sm text-muted-foreground">
            Continuous learning opportunities and clear career progression paths
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="glass-card p-8 lg:p-12 text-center bg-gradient-to-br from-ai-red/5 to-ai-orange/5 border-ai-red/20">
      <h2 class="text-2xl lg:text-3xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h2>
      <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
        Explore our open positions and find the perfect role for you. Your next career adventure awaits!
      </p>
      <NuxtLink
        to="/apply/positions"
        class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity text-lg"
      >
        <Briefcase class="w-5 h-5" />
        Explore Positions
      </NuxtLink>
    </div>
  </div>
</template>
