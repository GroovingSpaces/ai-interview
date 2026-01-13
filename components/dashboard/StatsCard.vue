<script setup lang="ts">
import { cn } from '~/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: any
  variant?: 'default' | 'gradient' | 'glass'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  change: 0,
})

const trendIcon = props.change > 0 ? TrendingUp : props.change < 0 ? TrendingDown : Minus
const trendColor = props.change > 0 ? 'text-score-excellent' : props.change < 0 ? 'text-score-low' : 'text-muted-foreground'
</script>

<template>
  <div
    :class="cn(
      'relative overflow-hidden rounded-2xl p-6 transition-all duration-300',
      variant === 'default' && 'bg-card border border-border hover:border-primary/30',
      variant === 'gradient' && 'bg-gradient-to-br from-primary/20 via-accent/10 to-ai-pink/10 border border-primary/20',
      variant === 'glass' && 'glass-card hover:ai-glow',
      props.class
    )"
  >
    <!-- Background decoration -->
    <div v-if="variant === 'gradient'" class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
    
    <div class="relative flex items-start justify-between">
      <div class="space-y-2">
        <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
        <p class="text-3xl font-bold text-foreground tracking-tight">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1.5">
          <component :is="trendIcon" :class="['w-4 h-4', trendColor]" />
          <span :class="['text-sm font-medium', trendColor]">
            {{ Math.abs(change) }}%
          </span>
          <span v-if="changeLabel" class="text-sm text-muted-foreground">{{ changeLabel }}</span>
        </div>
      </div>
      <div
        v-if="icon"
        class="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
      >
        <component :is="icon" class="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
</template>

