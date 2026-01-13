<script setup lang="ts">
import { computed } from 'vue'
import { getScoreColor, getScoreLabel } from '~/lib/utils'
import { Sparkles } from 'lucide-vue-next'

interface Props {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  size: 'md',
})

const scoreColor = computed(() => getScoreColor(props.score))
const scoreLabel = computed(() => getScoreLabel(props.score))

const colorClasses = {
  excellent: 'from-score-excellent to-emerald-400 text-score-excellent border-score-excellent/30 bg-score-excellent/10',
  good: 'from-score-good to-green-400 text-score-good border-score-good/30 bg-score-good/10',
  average: 'from-score-average to-yellow-400 text-score-average border-score-average/30 bg-score-average/10',
  low: 'from-score-low to-red-400 text-score-low border-score-low/30 bg-score-low/10',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-3 py-1 gap-1.5',
  lg: 'text-base px-4 py-1.5 gap-2',
}
</script>

<template>
  <div
    :class="[
      'inline-flex items-center rounded-full font-semibold border transition-all duration-200 hover:scale-105',
      colorClasses[scoreColor],
      sizeClasses[size],
    ]"
  >
    <Sparkles :class="size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'" />
    <span>{{ score }}%</span>
    <span v-if="showLabel" class="text-muted-foreground font-normal">· {{ scoreLabel }}</span>
  </div>
</template>

