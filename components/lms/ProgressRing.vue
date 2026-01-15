<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  value: number
  size?: number
  strokeWidth?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  strokeWidth: 8,
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value - (props.value / 100) * circumference.value)
</script>

<template>
  <div :class="cn('relative inline-flex items-center justify-center', props.class)">
    <svg :width="size" :height="size" class="transform -rotate-90">
      <!-- Gradient definition -->
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="50%" stop-color="#22C55E" />
          <stop offset="100%" stop-color="#34D399" />
        </linearGradient>
      </defs>

      <!-- Background circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
        class="stroke-muted/30"
      />

      <!-- Progress circle -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
        stroke="url(#progress-gradient)"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-all duration-700 ease-out"
      />
    </svg>

    <!-- Center content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-3xl font-bold text-foreground">{{ value }}%</span>
      <span class="text-sm text-muted-foreground">Complete</span>
    </div>
  </div>
</template>

