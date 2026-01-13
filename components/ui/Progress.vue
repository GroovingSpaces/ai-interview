<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  value: number
  max?: number
  showLabel?: boolean
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  showLabel: false,
  variant: 'default',
  size: 'md',
})

const percentage = computed(() => Math.min((props.value / props.max) * 100, 100))

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const variantClasses = {
  default: 'bg-primary',
  gradient: 'bg-gradient-to-r from-ai-cyan via-ai-purple to-ai-pink',
  success: 'bg-score-excellent',
  warning: 'bg-score-average',
  danger: 'bg-score-low',
}
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <div v-if="showLabel" class="flex justify-between mb-2 text-sm">
      <span class="text-muted-foreground"><slot /></span>
      <span class="font-medium text-foreground">{{ Math.round(percentage) }}%</span>
    </div>
    <div
      :class="cn(
        'w-full rounded-full bg-muted/50 overflow-hidden',
        sizeClasses[size]
      )"
    >
      <div
        :class="cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          variantClasses[variant]
        )"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

